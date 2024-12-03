import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import MigratedUserWelcomeModal from '@components/MigratedUserWelcomeModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {MigratedUserModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<MigratedUserModalNavigatorParamList>();

function MigratedUserWelcomeModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animation: Animations.MODAL}}>
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
