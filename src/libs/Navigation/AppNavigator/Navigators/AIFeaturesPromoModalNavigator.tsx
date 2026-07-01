import React from 'react';
import AIFeaturesPromoModal from '@components/AIFeaturesPromoModal';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AIFeaturesPromoModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<AIFeaturesPromoModalNavigatorParamList>();

function AIFeaturesPromoModalNavigator() {
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
                    name={SCREENS.AI_FEATURES_PROMO_MODAL.DYNAMIC_ROOT}
                    component={AIFeaturesPromoModal}
                />
            </Stack.Navigator>
        </NoDropZone>
    );
}

export default AIFeaturesPromoModalNavigator;
