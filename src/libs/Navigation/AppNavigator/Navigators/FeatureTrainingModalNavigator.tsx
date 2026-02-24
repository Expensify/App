import React from 'react';
import {View} from 'react-native';
import AutoSubmitModal from '@components/AutoSubmitModal';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import ChangePolicyEducationalModal from '@pages/ChangePolicyEducationalModal';
import TrackTrainingPage from '@pages/TrackTrainingPage';
import SCREENS from '@src/SCREENS';

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
                    <Stack.Screen
                        name={SCREENS.CHANGE_POLICY_EDUCATIONAL_ROOT}
                        component={ChangePolicyEducationalModal}
                    />
                    <Stack.Screen
                        name={SCREENS.AUTO_SUBMIT_ROOT}
                        component={AutoSubmitModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default FeatureTrainingModalNavigator;
