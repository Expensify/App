import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';

import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Insights, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {findFocusedRoute, useNavigation, useNavigationState} from '@react-navigation/native';
import React, {useEffect} from 'react';

// Do not lazy load Search navigator for performance reasons
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import TabNavigatorBar from './TabNavigatorBar';
import {HomePageScreen, InsightsPageScreen, ReportsSplitNavigatorScreen, SettingsSplitNavigatorScreen, WorkspaceNavigatorScreen} from './tabScreens';

const renderTabBar = ({state}: BottomTabBarProps) => <TabNavigatorBar state={state} />;

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded — swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.SETTINGS.ROOT]);

const TAB_SCREEN_OPTIONS_BASE = {
    headerShown: false,
    lazy: true,
    animation: 'none' as const,
    freezeOnBlur: true,
} as const;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    const screenOptions = {
        ...TAB_SCREEN_OPTIONS_BASE,
        sceneStyle: {flex: 1, backgroundColor: theme.appBG},
        tabBarPosition: shouldUseNarrowLayout ? ('bottom' as const) : ('left' as const),
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            tabBar={renderTabBar}
            screenOptions={screenOptions}
            screenLayout={bottomTabScreenLayoutWrapper}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePageScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
            />
            <Tab.Screen
                name={SCREENS.INSIGHTS}
                component={InsightsPageScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigatorScreen}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
