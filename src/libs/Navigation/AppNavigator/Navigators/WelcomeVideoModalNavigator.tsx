import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import OnboardingWelcomeVideo from '@components/OnboardingWelcomeVideo';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WelcomeVideoModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<WelcomeVideoModalNavigatorParamList>();

function WelcomeVideoModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name={SCREENS.WELCOME_VIDEO.ROOT}
                        component={OnboardingWelcomeVideo}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

WelcomeVideoModalNavigator.displayName = 'WelcomeVideoModalNavigator';

export default WelcomeVideoModalNavigator;
