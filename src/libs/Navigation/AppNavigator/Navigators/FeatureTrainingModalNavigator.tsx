import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import TrackTrainingPage from '@pages/TrackTrainingPage';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<FeatureTrainingNavigatorParamList>();

function FeatureTrainingModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
                    <Stack.Screen
                        name={SCREENS.FEATURE_TRAINING_ROOT}
                        component={TrackTrainingPage}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

FeatureTrainingModalNavigator.displayName = 'FeatureTrainingModalNavigator';

export default FeatureTrainingModalNavigator;
