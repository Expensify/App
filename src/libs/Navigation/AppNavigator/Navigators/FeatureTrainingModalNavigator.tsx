import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import TrackTrainingPage from '@pages/TrackTrainingPage';
import SCREENS from '@src/SCREENS';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';

const Stack = createPlatformStackNavigator<FeatureTrainingNavigatorParamList>();

function FeatureTrainingModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animation: Animations.SLIDE_FROM_RIGHT}}>
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
