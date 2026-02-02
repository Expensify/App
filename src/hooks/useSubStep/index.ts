import type {ComponentType} from 'react';
import {useCallback, useMemo, useRef, useState} from 'react';
import type {SubStepProps, UseSubStep} from './types';

function calculateLastIndex(bodyContentLength: number, skipSteps: number[] = []) {
    let lastIndex = bodyContentLength - 1;
    while (skipSteps.includes(lastIndex)) {
        lastIndex -= 1;
    }

    return lastIndex;
}

/**
 * @deprecated This hook is will be removed once the refactor (https://github.com/Expensify/App/issues/79039) is complete. Use useSubPage hook instead.
 * This hook ensures uniform handling of components across different screens, enabling seamless integration and navigation through sub steps of the VBBA flow.
 * @param bodyContent - array of components to display in particular step
 * @param onFinished - callback triggered after finish last step
 * @param startFrom - initial index for bodyContent array
 * @param onNextSubStep - callback triggered after finish each step
 * @param skipSteps - array of indexes to skip
 */
export default function useSubStep<TProps extends SubStepProps>({bodyContent, onFinished, startFrom = 0, skipSteps = [], onNextSubStep = () => {}}: UseSubStep<TProps>) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    if (bodyContent.length === skipSteps.length) {
        throw new Error('All steps are skipped');
    }

    const lastScreenIndex = useMemo(() => calculateLastIndex(bodyContent.length, skipSteps), [bodyContent.length, skipSteps]);

    const prevScreen = useCallback(() => {
        let decrementNumber = 1;
        while (screenIndex - decrementNumber >= 0 && skipSteps.includes(screenIndex - decrementNumber)) {
            decrementNumber += 1;
        }
        const prevScreenIndex = screenIndex - decrementNumber;

        if (prevScreenIndex < 0) {
            return;
        }

        setScreenIndex(prevScreenIndex);
    }, [screenIndex, skipSteps]);

    const nextScreen = useCallback(
        (finishData?: unknown) => {
            if (isEditing.current) {
                isEditing.current = false;

                setScreenIndex(lastScreenIndex);

                return;
            }

            let incrementNumber = 1;
            while (screenIndex + incrementNumber < lastScreenIndex && skipSteps.includes(screenIndex + incrementNumber)) {
                incrementNumber += 1;
            }
            const nextScreenIndex = screenIndex + incrementNumber;

            if (nextScreenIndex === lastScreenIndex + 1) {
                onFinished(finishData);
            } else {
                onNextSubStep();
                setScreenIndex(nextScreenIndex);
            }
        },
        [screenIndex, lastScreenIndex, skipSteps, onFinished, onNextSubStep],
    );

    const moveTo = useCallback((step: number, turnOnEditMode?: boolean) => {
        isEditing.current = !(turnOnEditMode !== undefined && !turnOnEditMode);
        setScreenIndex(step);
    }, []);

    const resetScreenIndex = useCallback((newScreenIndex = 0) => {
        isEditing.current = false;
        setScreenIndex(newScreenIndex);
    }, []);

    const goToTheLastStep = useCallback(() => {
        isEditing.current = false;
        setScreenIndex(lastScreenIndex);
    }, [lastScreenIndex]);

    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        componentToRender: bodyContent.at(screenIndex) as ComponentType<SubStepProps & TProps>,
        isEditing: isEditing.current,
        screenIndex,
        prevScreen,
        nextScreen,
        lastScreenIndex,
        moveTo,
        resetScreenIndex,
        goToTheLastStep,
    };
}
