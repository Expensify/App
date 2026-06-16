import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import ExplanationModal from '@components/ExplanationModal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {ExplanationModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<ExplanationModalNavigatorParamList>();

function ExplanationModalNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator
                    screenOptions={{headerShown: false, animation: Animations.SLIDE_FROM_RIGHT, web: {transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC}}}
                >
                    <Stack.Screen
                        name={SCREENS.EXPLANATION_MODAL.ROOT}
                        component={ExplanationModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default ExplanationModalNavigator;
