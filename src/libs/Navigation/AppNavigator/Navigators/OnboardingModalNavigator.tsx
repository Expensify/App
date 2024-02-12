import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useThemeStyles from '@hooks/useThemeStyles';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles), [styles]);

    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{...screenOptions}}>
                    <Stack.Screen
                        name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                        component={OnboardingPersonalDetails}
                    />
                    <Stack.Screen
                        name={SCREENS.ONBOARDING.PURPOSE}
                        component={OnboardingPurpose}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;
