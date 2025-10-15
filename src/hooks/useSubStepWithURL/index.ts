import {useRoute} from '@react-navigation/native';
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

function findStepIndex(bodyContent: Array<{screenName: string; component: ComponentType<any>}>, subStep?: string): number {
    if (!subStep) {
        return 0; // Default to first step if no subStep provided
    }

    const index = bodyContent.findIndex((item) => item.screenName === subStep);
    return index !== -1 ? index : 0; // Return found index or default to 0
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
}: UseSubStep<TProps> & {stepNames?: string[]}) {
    const route = useRoute();

    const [screenIndex] = useState(() => {
        const subStep = route.params.subStep;
        return subStep ? findStepIndex(bodyContent, subStep) : startFrom;
    });
    const isEditing = useRef(false);

    // Function to navigate to a specific step with URL update
    const navigateToStep = useCallback(
        (index: number) => {
            const stepName = bodyContent.at(index).screenName;
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(stepName));
        },
        [bodyContent],
    );

    if (bodyContent.length === skipSteps.length) {
        throw new Error('All steps are skipped');
    }

    const lastScreenIndex = useMemo(() => calculateLastIndex(bodyContent.length, skipSteps), [bodyContent.length, skipSteps]);

    const prevScreen = useCallback(() => {}, []);

    const nextScreen = useCallback(
        (finishData?: unknown) => {
            navigateToStep(screenIndex + 1);
        },
        [screenIndex, navigateToStep],
    );

    const moveTo = useCallback((step: number, turnOnEditMode?: boolean) => {}, []);

    const resetScreenIndex = useCallback((newScreenIndex = 0) => {}, []);

    const goToTheLastStep = useCallback(() => {}, []);

    // eslint-disable-next-line react-compiler/react-compiler
    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        componentToRender: bodyContent.at(screenIndex).component as ComponentType<SubStepProps & TProps>,
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
