import React from 'react';
import CenteredModalLayout from '@components/CenteredModalLayout';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import ExplanationModal from '@components/ExplanationModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ExplanationModalNavigatorParamList} from '@libs/Navigation/types';
import {completeHybridAppOnboarding} from '@userActions/Welcome';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<ExplanationModalNavigatorParamList>();

function ExplanationModalNavigator() {
    return (
        <NoDropZone>
            <CenteredModalLayout onBackdropPress={completeHybridAppOnboarding}>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name={SCREENS.EXPLANATION_MODAL.ROOT}
                        component={ExplanationModal}
                    />
                </Stack.Navigator>
            </CenteredModalLayout>
        </NoDropZone>
    );
}

export default ExplanationModalNavigator;
