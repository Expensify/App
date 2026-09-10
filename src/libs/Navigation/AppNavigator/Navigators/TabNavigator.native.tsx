import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {NavigationAction, NavigationState, Router, TabNavigationState} from '@react-navigation/native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded — swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.SETTINGS.ROOT]);

const TAB_SCREEN_OPTIONS_BASE = {
    headerShown: false,
    lazy: true,
    tabBarControllerMode: 'tabBar' as const,
    tabBarMinimizeBehavior: 'onScrollDown' as const,
} as const;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because TabNavigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((r) => r.key === route.key)?.state as NavigationState | undefined);

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    useEffect(() => {
        // stale === false distinguishes a fully realized NavigationState from a PartialState.
        if (!tabState || tabState.stale !== false) {
            return;
        }
        setPreservedNavigatorState(route.key, tabState);
    }, [tabState, route.key]);

    // The slicing optimization in useCustomRootStackNavigatorState can unmount and later remount
    // this TAB_NAVIGATOR. Without restoration it would default to index 0. We restore the saved
    // state by overriding the bottom-tab router's getInitialState — the same pattern SplitRouter
    // uses for its split navigators.
    const tabRouterOverride = <Action extends NavigationAction>(
        originalRouter: Router<TabNavigationState<TabNavigatorParamList>, Action>,
    ): Partial<Router<TabNavigationState<TabNavigatorParamList>, Action>> => ({
        getInitialState: (configOptions) => {
            const preserved = getPreservedNavigatorState<TabNavigationState<TabNavigatorParamList>>(route.key);
            return preserved ? originalRouter.getRehydratedState(preserved, configOptions) : originalRouter.getInitialState(configOptions);
        },
    });

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            screenOptions={TAB_SCREEN_OPTIONS_BASE}
            UNSTABLE_router={tabRouterOverride}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={{
                    tabBarLabel: translate('common.home'),
                    tabBarIcon: {type: 'sfSymbol', name: 'house'},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: translate('common.inbox'),
                    tabBarIcon: {type: 'sfSymbol', name: 'tray'},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{
                    tabBarLabel: translate('common.spend'),
                    tabBarSystemItem: 'search',
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: translate('common.settings'),
                    tabBarIcon: {type: 'sfSymbol', name: 'gear'},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: translate('common.workspacesTabTitle'),
                    tabBarIcon: {type: 'sfSymbol', name: 'building.2'},
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
