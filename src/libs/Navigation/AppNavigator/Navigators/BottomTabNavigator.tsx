import {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import AllSettingsScreen from '@pages/home/sidebar/AllSettingsScreen';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import SCREENS from '@src/SCREENS';

const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
};

function BottomTabNavigator() {
    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen
                name={SCREENS.HOME}
                component={SidebarScreen}
            />
            <Tab.Screen
                name={SCREENS.ALL_SETTINGS}
                component={AllSettingsScreen}
            />
            <Tab.Screen
                name={SCREENS.WORKSPACE.INITIAL}
                getComponent={loadWorkspaceInitialPage}
            />
        </Tab.Navigator>
    );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
