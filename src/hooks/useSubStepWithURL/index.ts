import type {ComponentType} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {SubStepProps, UseSubStep} from './types';

function calculateLastIndex(bodyContentLength: number, skipSteps: number[] = []) {
    let lastIndex = bodyContentLength - 1;
    while (skipSteps.includes(lastIndex)) {
        lastIndex -= 1;
    }

    return lastIndex;
}

/**
 * This hook ensures uniform handling of components across different screens, enabling seamless integration and navigation through sub steps of the VBBA flow.
 * @param bodyContent - array of components to display in particular step
 * @param onFinished - callback triggered after finish last step
 * @param startFrom - initial index for bodyContent array
 * @param onNextSubStep - callback triggered after finish each step
 * @param skipSteps - array of indexes to skip
 * @param stepNames - array of step names corresponding to each index for URL parameters
 */
export default function useSubStepWithURL<TProps extends SubStepProps>({
    bodyContent, 
    onFinished, 
    startFrom = 0, 
    skipSteps = [], 
    onNextSubStep = () => {},
    stepNames = ['Country', 'Details', 'AccountType', 'BankInfo', 'AccountHolder', 'Confirmation', 'Success']
}: UseSubStep<TProps> & {stepNames?: string[]}) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    // Function to get step name from screen index
    const getStepName = useCallback((index: number) => {
        return stepNames[index] || `Step${index}`;
    }, [stepNames]);

    // Function to navigate to a specific step with URL update
    const navigateToStep = useCallback((index: number) => {
        const stepName = getStepName(index);
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(stepName));
    }, [getStepName]);

    // Set initial URL parameter when component mounts or startFrom changes
    useEffect(() => {
        navigateToStep(startFrom);
    }, [startFrom, navigateToStep]);

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
        navigateToStep(prevScreenIndex);
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
                navigateToStep(nextScreenIndex);
            }
        },
        [screenIndex, lastScreenIndex, skipSteps, onFinished, onNextSubStep, navigateToStep],
    );

    const moveTo = useCallback((step: number, turnOnEditMode?: boolean) => {
        isEditing.current = !(turnOnEditMode !== undefined && !turnOnEditMode);
        setScreenIndex(step);
        navigateToStep(step);
    }, [navigateToStep]);

    const resetScreenIndex = useCallback((newScreenIndex = 0) => {
        isEditing.current = false;
        setScreenIndex(newScreenIndex);
        navigateToStep(newScreenIndex);
    }, [navigateToStep]);

    const goToTheLastStep = useCallback(() => {
        isEditing.current = false;
        setScreenIndex(lastScreenIndex);
        navigateToStep(lastScreenIndex);
    }, [lastScreenIndex, navigateToStep]);

    // eslint-disable-next-line react-compiler/react-compiler
    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        componentToRender: bodyContent.at(screenIndex) as ComponentType<SubStepProps & TProps>,
        // eslint-disable-next-line react-compiler/react-compiler
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
