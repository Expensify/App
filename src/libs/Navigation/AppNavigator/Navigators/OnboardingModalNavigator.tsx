import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import OnboardingModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/OnboardingModalNavigatorScreenOptions';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const isModalFocused = useRef(true);
    const screenOptions = useMemo(() => OnboardingModalNavigatorScreenOptions(styles), [styles]);
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    return (
        <NoDropZone>
            <Overlay onPress={() => {}} />
            <View
                onClick={() => {
                    isModalFocused.current = false;
                }}
                style={styles.onboardingNavigatorOuterView}
            >
                <View
                    onClick={(e) => {
                        isModalFocused.current = true;
                        e.stopPropagation();
                    }}
                    style={styles.OnboardingNavigatorInnerView(shouldUseNarrowLayout)}
                >
                    <Stack.Navigator screenOptions={screenOptions}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                            component={() => <OnboardingPersonalDetails isModalFocused={isModalFocused} />}
                        />
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PURPOSE}
                            component={OnboardingPurpose}
                        />
                    </Stack.Navigator>
                </View>
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;
