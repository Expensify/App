import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import ExplanationModal from '@components/ExplanationModal';
import type {ExplanationModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<ExplanationModalNavigatorParamList>();

function ExplanationModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
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
