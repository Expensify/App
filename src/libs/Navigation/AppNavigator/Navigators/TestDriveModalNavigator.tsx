import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import TestDriveModal from '@components/TestDrive/Modal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {TestDriveModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<TestDriveModalNavigatorParamList>();

function TestDriveModalNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator
                    screenOptions={{headerShown: false, animation: Animations.SLIDE_FROM_RIGHT, web: {transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC}}}
                >
                    <Stack.Screen
                        name={SCREENS.TEST_DRIVE_MODAL.ROOT}
                        component={TestDriveModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default TestDriveModalNavigator;
