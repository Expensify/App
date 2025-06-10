import React from 'react';
import {View} from 'react-native';
import AutoSubmitModal from '@components/AutoSubmitModal';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {AutoSubmitModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<AutoSubmitModalNavigatorParamList>();

function AutoSubmitModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false, animation: Animations.SLIDE_FROM_RIGHT}}>
                    <Stack.Screen
                        name={SCREENS.AUTO_SUBMIT_MODAL.ROOT}
                        component={AutoSubmitModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

AutoSubmitModalNavigator.displayName = 'AutoSubmitModalNavigator';

export default AutoSubmitModalNavigator;
