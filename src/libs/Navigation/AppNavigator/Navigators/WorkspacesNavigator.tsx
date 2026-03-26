/**
 * Stack Navigator containing WorkspacesList and WorkspaceSplit screens.
 */
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import variables from '@styles/variables';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import DomainSplitNavigator from './DomainSplitNavigator';
import WorkspaceSplitNavigator from './WorkspaceSplitNavigator';

const Stack = createStackNavigator<WorkspaceNavigatorParamList>();

function WorkspacesNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const splitNavigatorAnimation = shouldUseNarrowLayout ? Animations.SLIDE_FROM_RIGHT : Animations.NONE;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: Animations.NONE,
            }}
        >
            <Stack.Screen
                name={SCREENS.WORKSPACES_LIST}
                component={WorkspacesListPage}
                options={{cardStyle: [!shouldUseNarrowLayout && {paddingLeft: variables.navigationTabBarSize}]}}
            />
            <Stack.Screen
                name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                options={{animation: splitNavigatorAnimation}}
                component={WorkspaceSplitNavigator}
            />
            <Stack.Screen
                name={NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR}
                options={{animation: splitNavigatorAnimation}}
                component={DomainSplitNavigator}
            />
        </Stack.Navigator>
    );
}

export default WorkspacesNavigator;
