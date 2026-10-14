import {clearOnboardingMergeAccountBlocked, setOnboardingErrorMessage} from '@userActions/Welcome';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';

import type {OnboardingWorkEmailProps} from './types';

import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';

function OnboardingWorkEmail(props: OnboardingWorkEmailProps) {
    const {index: routeIndex} = props.navigation.getState();

    // To block android native back button behavior
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                // We don't want to block the back button if this is not the first route, e.g. when the intent list sent us here.
                // Clear any work email error like the header back button does, and return false so navigation still pops the screen.
                if (routeIndex !== 0) {
                    clearOnboardingMergeAccountBlocked();
                    return false;
                }

                // Return true to indicate that the back button press is handled here
                setOnboardingErrorMessage('onboarding.purpose.errorBackButton');
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [routeIndex]),
    );
    return (
        <BaseOnboardingWorkEmail
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkEmail;
