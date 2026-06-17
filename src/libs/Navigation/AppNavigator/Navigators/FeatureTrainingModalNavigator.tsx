import React from 'react';
import AutoSubmitModal from '@components/AutoSubmitModal';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import ChangePolicyEducationalModal from '@pages/ChangePolicyEducationalModal';
import TrackTrainingPage from '@pages/TrackTrainingPage';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<FeatureTrainingNavigatorParamList>();

function FeatureTrainingModalNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NoDropZone>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: Animations.SLIDE_FROM_RIGHT, web: {transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC}
                    native: {contentStyle: {backgroundColor: 'transparent'}},
                    web: {cardStyle: {backgroundColor: 'transparent'}},
                }}
            >
                <Stack.Screen
                    name={SCREENS.FEATURE_TRAINING_ROOT}
                    component={TrackTrainingPage}
                />
                <Stack.Screen
                    name={SCREENS.DYNAMIC_CHANGE_POLICY_EDUCATIONAL_ROOT}
                    component={ChangePolicyEducationalModal}
                />
                <Stack.Screen
                    name={SCREENS.AUTO_SUBMIT_ROOT}
                    component={AutoSubmitModal}
                />
            </Stack.Navigator>
        </NoDropZone>
    );
}

export default FeatureTrainingModalNavigator;
