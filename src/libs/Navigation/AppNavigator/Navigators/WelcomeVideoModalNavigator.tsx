import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import OnboardingWelcomeVideo from '@components/OnboardingWelcomeVideo';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import WelcomeVideoModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/WelcomeVideoModalNavigatorScreenOptions';
import type {WelcomeVideoModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createStackNavigator<WelcomeVideoModalNavigatorParamList>();

function WelcomeVideoModalNavigator() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    return (
        <NoDropZone>
            <Overlay />
            <View style={styles.welcomeVideoNavigatorOuterView}>
                <View style={styles.WelcomeVideoNavigatorInnerView(shouldUseNarrowLayout)}>
                    <Stack.Navigator screenOptions={WelcomeVideoModalNavigatorScreenOptions()}>
                        <Stack.Screen
                            name={SCREENS.WELCOME_VIDEO.ROOT}
                            component={OnboardingWelcomeVideo}
                        />
                    </Stack.Navigator>
                </View>
            </View>
        </NoDropZone>
    );
}

WelcomeVideoModalNavigator.displayName = 'WelcomeVideoModalNavigator';

export default WelcomeVideoModalNavigator;
