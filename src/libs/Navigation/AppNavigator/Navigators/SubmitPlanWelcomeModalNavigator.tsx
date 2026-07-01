import React from 'react';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import SubmitPlanWelcomeModal from '@components/SubmitPlanWelcomeModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SubmitPlanModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<SubmitPlanModalNavigatorParamList>();

function SubmitPlanWelcomeModalNavigator() {
    return (
        <NoDropZone>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    web: {cardStyle: {backgroundColor: 'transparent'}},
                    native: {contentStyle: {backgroundColor: 'transparent'}},
                }}
            >
                <Stack.Screen
                    name={SCREENS.SUBMIT_PLAN_WELCOME_MODAL.DYNAMIC_ROOT}
                    component={SubmitPlanWelcomeModal}
                />
            </Stack.Navigator>
        </NoDropZone>
    );
}

export default SubmitPlanWelcomeModalNavigator;
