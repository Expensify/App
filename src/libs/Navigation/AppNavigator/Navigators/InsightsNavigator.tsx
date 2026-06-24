/**
 * Single-screen navigator for the top-level Insights tab. The active sub-tab is read from
 * `route.params.tab` (set by the linking config from the `:tab?` URL segment) so changing
 * tabs is a same-screen params update — no stack push, no animation.
 */
import React from 'react';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';
import InsightsPage from '@pages/Insights/InsightsPage';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<InsightsNavigatorParamList>();

function InsightsNavigator(_props: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.INSIGHTS_NAVIGATOR>) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: Animations.NONE,
            }}
        >
            <Stack.Screen
                name={SCREENS.INSIGHTS.ROOT}
                component={InsightsPage}
            />
        </Stack.Navigator>
    );
}

export default InsightsNavigator;
