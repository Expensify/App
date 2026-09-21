import useOnyx from '@hooks/useOnyx';

import {updateOnboardingValuesAndNavigation} from '@userActions/Welcome';

import ONYXKEYS from '@src/ONYXKEYS';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';

import type {OnboardingWorkEmailValidationProps} from './types';

import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isMergingAccountBlocked = onboardingValues?.isMergingAccountBlocked;

    // The work email screen force-replaces itself with this one, so this is the only route left in the onboarding
    // stack. Without a handler, Android's system Back bubbles up to the parent stack and pops the whole onboarding
    // modal while `shouldValidate` is still set, so validation reopens the next time onboarding resumes. Run the same
    // cleanup and fallback the header Back button runs instead.
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                // The header hides Back while merging is blocked, so system Back is swallowed rather than acted on, to
                // keep the two in step.
                if (!isMergingAccountBlocked) {
                    updateOnboardingValuesAndNavigation(onboardingValues);
                }

                // Return true to indicate that the back button press is handled here
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [onboardingValues, isMergingAccountBlocked]),
    );

    return (
        <BaseOnboardingWorkEmailValidation
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkEmailValidation;
