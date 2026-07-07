import NoDropZone from '@components/DragAndDrop/NoDropZone';
import MigratedUserWelcomeModal from '@components/MigratedUserWelcomeModal';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {MigratedUserModalNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

const Stack = createPlatformStackNavigator<MigratedUserModalNavigatorParamList>();

function MigratedUserWelcomeModalNavigator() {
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
                    name={SCREENS.MIGRATED_USER_WELCOME_MODAL.DYNAMIC_ROOT}
                    component={MigratedUserWelcomeModal}
                />
            </Stack.Navigator>
        </NoDropZone>
    );
}

export default MigratedUserWelcomeModalNavigator;
