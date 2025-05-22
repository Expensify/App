import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function OnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
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
        <BaseOnboardingWorkspaceConfirmation
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWorkspaceConfirmation.displayName = 'OnboardingWorkspaceConfirmation';

export default OnboardingWorkspaceConfirmation;
