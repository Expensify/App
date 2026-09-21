import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';

import type {OnboardingWorkspacesProps} from './types';

import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';
import useShouldHideBackButton from './useShouldHideBackButton';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    const shouldHideBackButton = useShouldHideBackButton(rest.route.params?.backTo);

    // To block android native back button behavior. Without this, system Back bubbles past the onboarding stack to the
    // root stack, which pops the whole onboarding modal mid-flow. Only swallow it when there is nothing to go back to,
    // which is the same condition that hides the header Back button; "Skip for now" remains the forward exit.
    useFocusEffect(
        useCallback(() => {
            // We don't want to block the back button when a real screen sits behind this one
            if (!shouldHideBackButton) {
                return;
            }

            // Return true to indicate that the back button press is handled here
            const backAction = () => true;

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [shouldHideBackButton]),
    );

    return (
        <BaseOnboardingWorkspaces
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaces;
