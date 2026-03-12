/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {lazy, Suspense} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {RootTabNavigatorParamList} from '@libs/Navigation/types';
import HomePage from '@pages/home/HomePage';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// RootTabNavigatorTabBar renders an invisible placeholder so that the bottom tab navigator
// does not show its own tab bar. The actual NavigationTabBar is rendered by TopLevelNavigationTabBar
// which is positioned at the root level to avoid overflow:hidden clipping on web.
function RootTabNavigatorTabBar() {
    return <View style={{height: 0}} />;
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
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBar={() => <RootTabNavigatorTabBar />}
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
