import type {ComponentType} from 'react';
import {useCallback, useRef, useState} from 'react';
import type {SubStepProps, UseSubStep} from './types';

/**
 * This hook ensures uniform handling of components across different screens, enabling seamless integration and navigation through sub steps of the VBBA flow.
 * @param bodyContent - array of components to display in particular step
 * @param onFinished - callback triggered after finish last step
 * @param startFrom - initial index for bodyContent array
 * @param onNextSubStep - callback triggered after finish each step
 */
export default function useSubStep<TProps extends SubStepProps>({bodyContent, onFinished, startFrom = 0, onNextSubStep = () => {}}: UseSubStep<TProps>) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    const prevScreen = useCallback(() => {
        const prevScreenIndex = screenIndex - 1;

        if (prevScreenIndex < 0) {
            return;
        }

        setScreenIndex(prevScreenIndex);
    }, [screenIndex]);

    const nextScreen = useCallback(
        (finishData?: unknown) => {
            if (isEditing.current) {
                isEditing.current = false;

                setScreenIndex(bodyContent.length - 1);

                return;
            }

            const nextScreenIndex = screenIndex + 1;

            if (nextScreenIndex === bodyContent.length) {
                onFinished(finishData);
            } else {
                onNextSubStep();
                setScreenIndex(nextScreenIndex);
            }
        },
        [screenIndex, bodyContent.length, onFinished, onNextSubStep],
    );

    const moveTo = useCallback((step: number) => {
        isEditing.current = true;
        setScreenIndex(step);
    }, []);

    const resetScreenIndex = useCallback(() => {
        setScreenIndex(0);
    }, []);

    const goToTheLastStep = useCallback(() => {
        isEditing.current = false;
        setScreenIndex(bodyContent.length - 1);
    }, [bodyContent]);

    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        componentToRender: bodyContent.at(screenIndex) as ComponentType<SubStepProps & TProps>,
        isEditing: isEditing.current,
        screenIndex,
        prevScreen,
        nextScreen,
        moveTo,
        resetScreenIndex,
        goToTheLastStep,
    };
}
