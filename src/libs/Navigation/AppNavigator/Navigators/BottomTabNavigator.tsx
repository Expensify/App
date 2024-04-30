import {useNavigationState} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import type {BottomTabNavigatorParamList, CentralPaneName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import SearchPageBottomTab from '@pages/Search/SearchPageBottomTab';
import SCREENS from '@src/SCREENS';
import ActiveRouteContext from './ActiveRouteContext';

const loadInitialSettingsPage = () => require('../../../../pages/settings/InitialSettingsPage').default as React.ComponentType;

const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
    animationEnabled: false,
};

function BottomTabNavigator() {
    const activeRoute = useNavigationState<RootStackParamList, NavigationPartialRoute<CentralPaneName> | undefined>(getTopmostCentralPaneRoute);

    return (
        <ActiveRouteContext.Provider value={activeRoute}>
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
        </ActiveRouteContext.Provider>
    );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
