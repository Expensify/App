import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import MigratedUserWelcomeModal from '@components/MigratedUserWelcomeModal';
import type {MigratedUserModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<MigratedUserModalNavigatorParamList>();

function MigratedUserWelcomeModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
                    <Stack.Screen
                        name={SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT}
                        component={MigratedUserWelcomeModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

MigratedUserWelcomeModalNavigator.displayName = 'MigratedUserWelcomeModalNavigator';

export default MigratedUserWelcomeModalNavigator;
