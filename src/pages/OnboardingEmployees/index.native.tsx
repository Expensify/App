import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import SCREENS from '@src/SCREENS';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees(props: OnboardingEmployeesProps) {
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES);
    const isEmployeesFirstStep = onboardingStep?.stepCounter.step === 1;

    // To block android native back button behavior
    useFocusEffect(
        useCallback(() => {
            // We don't want to block the back button if this is not the first route
            if (!isEmployeesFirstStep) {
                return;
            }

            // Return true to indicate that the back button press is handled here
            const backAction = () => true;

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [isEmployeesFirstStep]),
    );

    return (
        <BaseOnboardingEmployees
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingEmployees;
