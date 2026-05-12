import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import BaseOnboardingWorkspaceInvite from './BaseOnboardingWorkspaceInvite';
import type {OnboardingWorkspaceInviteProps} from './types';

function OnboardingWorkspaceInvite(props: OnboardingWorkspaceInviteProps) {
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
        <BaseOnboardingWorkspaceInvite
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default OnboardingWorkspaceInvite;
