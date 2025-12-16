import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import MigratedUserWelcomeModal from '@components/MigratedUserWelcomeModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {MigratedUserModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<MigratedUserModalNavigatorParamList>();

function MigratedUserWelcomeModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name={SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT}
                        component={MigratedUserWelcomeModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default MigratedUserWelcomeModalNavigator;
