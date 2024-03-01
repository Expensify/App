import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import OnboardingWelcomeVideo from '@components/OnboardingWelcomeVideo';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WelcomeVideoModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<WelcomeVideoModalNavigatorParamList>();

function WelcomeVideoModalNavigator() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    return (
        <NoDropZone>
            <View>
                <View style={styles.WelcomeVideoNavigatorInnerView(shouldUseNarrowLayout)}>
                    <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
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
