import type {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import SearchPageBottomTab from '@pages/Search/SearchPageBottomTab';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;
const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
    animationEnabled: false,
};

function BottomTabNavigator() {
    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen
                name={SCREENS.HOME}
                component={SidebarScreen}
            />
            <Tab.Screen
                name={SCREENS.SEARCH.BOTTOM_TAB}
                component={SearchPageBottomTab}
            />
            <Tab.Screen
                name={SCREENS.SETTINGS.ROOT}
                getComponent={loadInitialSettingsPage}
            />
        </Tab.Navigator>
    );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
