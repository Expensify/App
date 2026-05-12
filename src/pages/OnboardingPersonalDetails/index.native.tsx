import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';
import type {OnboardingPersonalDetailsProps} from './types';

function OnboardingPersonalDetails({...rest}: OnboardingPersonalDetailsProps) {
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
        <BaseOnboardingPersonalDetails
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default OnboardingPersonalDetails;
