import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';
import type {OnboardingWorkEmailProps} from './types';

function OnboardingWorkEmail(props: OnboardingWorkEmailProps) {
    // To block android native back button behavior
    useFocusEffect(
        useCallback(() => {
            // Return true to indicate that the back button press is handled here
            const backAction = () => true;

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, []),
    );
    return (
        <BaseOnboardingWorkEmail
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';

export default OnboardingWorkEmail;
