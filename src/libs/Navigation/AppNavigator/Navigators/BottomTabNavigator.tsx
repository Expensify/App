import {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import {Text, View} from 'react-native';
import {PressableWithFeedback} from '@components/Pressable';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

// TODO-IDEAL replace with the actuall screen.
function SecondTab() {
    return (
        <View>
            <Text style={{color: 'white', fontSize: 30}}>Expensify settings</Text>

            <PressableWithFeedback
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel="Workspaces"
                onPress={() => {
                    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
                }}
            >
                <Text style={{color: 'white', fontSize: 30}}>Workspaces</Text>
            </PressableWithFeedback>
        </View>
    );
}

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
                component={SecondTab}
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
