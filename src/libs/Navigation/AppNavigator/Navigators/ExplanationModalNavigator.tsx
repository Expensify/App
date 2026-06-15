import React from 'react';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import ExplanationModalScreen from '@components/ExplanationModalScreen';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ExplanationModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<ExplanationModalNavigatorParamList>();

function ExplanationModalNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NoDropZone>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    // The screen renders its own backdrop and bottom-docked card (CenteredModalLayout),
                    // so it has to be transparent to let the root navigator's overlay show through.
                    native: {contentStyle: {backgroundColor: 'transparent'}},
                    web: {cardStyle: {backgroundColor: 'transparent'}},
                }}
            >
                <Stack.Screen
                    name={SCREENS.EXPLANATION_MODAL.ROOT}
                    component={ExplanationModalScreen}
                />
            </Stack.Navigator>
        </NoDropZone>
    );
}

export default ExplanationModalNavigator;
