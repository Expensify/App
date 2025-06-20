import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import ExplanationModal from '@components/ExplanationModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {ExplanationModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<ExplanationModalNavigatorParamList>();

function ExplanationModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animation: Animations.SLIDE_FROM_RIGHT}}>
                    <Stack.Screen
                        name={SCREENS.EXPLANATION_MODAL.ROOT}
                        component={ExplanationModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

ExplanationModalNavigator.displayName = 'ExplanationModalNavigator';

export default ExplanationModalNavigator;
