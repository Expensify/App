/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { lazy, Suspense } from 'react';
import { View } from 'react-native';
import type { ValueOf } from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import type { RootTabNavigatorParamList } from '@libs/Navigation/types';
import HomePage from '@pages/home/HomePage';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const ROUTE_TO_NAVIGATION_TAB: Record<string, ValueOf<typeof NAVIGATION_TABS>> = {
    [SCREENS.HOME]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.INBOX,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [SCREENS.WORKSPACES_LIST]: NAVIGATION_TABS.WORKSPACES,
};

function RootTabNavigatorTabBar(props: BottomTabBarProps) {
    const selectedRouteName = props.state.routes[props.state.index]?.name;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[selectedRouteName ?? ''] ?? NAVIGATION_TABS.HOME;
    console.log(props)
    return (
        <NavigationTabBar
            selectedTab={selectedTab}
        />
        // <View/>
    );
}

const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySearchFullscreenNavigator = lazy(() => import('./SearchFullscreenNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));

function withSuspense<P extends Record<string, unknown>>(LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>) {
    function SuspenseWrapper(props: P) {
        return (
            <Suspense fallback={<FullScreenLoadingIndicator />}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <LazyComponent {...props} />
            </Suspense>
        );
    }
    return SuspenseWrapper;
}

const ReportsSplitNavigatorScreen = withSuspense(LazyReportsSplitNavigator);
const SearchFullscreenNavigatorScreen = withSuspense(LazySearchFullscreenNavigator);
const SettingsSplitNavigatorScreen = withSuspense(LazySettingsSplitNavigator);

const Tab = createBottomTabNavigator<RootTabNavigatorParamList>();

function RootTabNavigator() {
    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            tabBar={(props) => <RootTabNavigatorTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                lazy: true,
                animation: 'none',
                sceneStyle: {flex: 1},
            }}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={SCREENS.WORKSPACES_LIST}
                component={WorkspacesListPage}
            />
        </Tab.Navigator>
    );
}

export default RootTabNavigator;
