import type {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import {navigationSidebarRef} from '@libs/Navigation/navigationRef';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import ActiveRouteContext from './ActiveRouteContext';
import LeftModalNavigator from './LeftModalNavigator';

const loadInitialSettingsPage = () => require('../../../../pages/settings/InitialSettingsPage').default as React.ComponentType;
const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
    animationEnabled: false,
};

function BottomTabNavigator() {
    const activeRoute = getTopmostCentralPaneRoute(navigationSidebarRef.getRootState());

    return (
        <ActiveRouteContext.Provider value={activeRoute?.name ?? ''}>
            <Tab.Navigator screenOptions={screenOptions}>
                <Tab.Screen
                    name={SCREENS.HOME}
                    component={SidebarScreen}
                />
                <Tab.Screen
                    name={SCREENS.SETTINGS.ROOT}
                    getComponent={loadInitialSettingsPage}
                />
                <Tab.Screen
                    name={SCREENS.WORKSPACE.INITIAL}
                    getComponent={loadWorkspaceInitialPage}
                />

                <Tab.Screen
                    name={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
                    component={LeftModalNavigator}
                    // options={screenOptions.leftModalNavigator}
                    // listeners={modalScreenListeners}
                />
            </Tab.Navigator>
        </ActiveRouteContext.Provider>
    );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
