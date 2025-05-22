import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import BaseOnboardingWorkspaceOptional from './BaseOnboardingWorkspaceOptional';
import type {OnboardingWorkspaceOptionalProps} from './types';

function OnboardingWorkspaceOptional(props: OnboardingWorkspaceOptionalProps) {
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
        <BaseOnboardingWorkspaceOptional
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingWorkspaceOptional.displayName = 'OnboardingWorkspaceOptional';

export default OnboardingWorkspaceOptional;
