import React from 'react';
import {View} from 'react-native';
import AIFeaturesPromoModal from '@components/AIFeaturesPromoModal';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AIFeaturesPromoModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<AIFeaturesPromoModalNavigatorParamList>();

function AIFeaturesPromoModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name={SCREENS.AI_FEATURES_PROMO_MODAL.ROOT}
                        component={AIFeaturesPromoModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default AIFeaturesPromoModalNavigator;
