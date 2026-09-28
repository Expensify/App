import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';

import type {OnboardingWorkspacesProps} from './types';

import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    const {index: routeIndex} = rest.navigation.getState();

    // To block android native back button behavior
    useFocusEffect(
        useCallback(() => {
            // We don't want to block the back button if this is not the first route
            if (routeIndex !== 0) {
                return;
            }

            // Return true to indicate that the back button press is handled here
            const backAction = () => true;

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [routeIndex]),
    );

    return (
        <BaseOnboardingWorkspaces
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaces;
