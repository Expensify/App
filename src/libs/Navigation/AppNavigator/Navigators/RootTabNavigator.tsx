/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {lazy, Suspense, useMemo} from 'react';
import {Platform, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import type {RootTabNavigatorParamList} from '@libs/Navigation/types';
import HomePage from '@pages/home/HomePage';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import variables from '@styles/variables';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const ROUTE_TO_NAVIGATION_TAB: Record<string, ValueOf<typeof NAVIGATION_TABS>> = {
    [SCREENS.HOME]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.INBOX,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [SCREENS.WORKSPACES_LIST]: NAVIGATION_TABS.WORKSPACES,
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: NAVIGATION_TABS.WORKSPACES,
};

/**
 * Only receives `state` (not the full BottomTabBarProps) so that React.memo
 * can effectively prevent re-renders. The `descriptors` object in BottomTabBarProps
 * is recreated on every render, which would defeat memoization.
 *
 * Wrapped in a View with overflow: 'visible' so that the absolutely-positioned
 * floating buttons (FAB, GPS, Camera) rendered by NavigationTabBar can extend
 * above the tab bar area without being clipped.
 *
 * Performance: avoids useResponsiveLayout() which subscribes to NavigationContext
 * and NavigationContainerRefContext — both fire on every navigation action.
 * On native, shouldUseNarrowLayout is always true. On web, we read window.innerWidth
 * synchronously (parent re-renders on resize propagate here).
 */
function RootTabNavigatorTabBar({tabState}: {tabState: BottomTabBarProps['state']}) {
    const isNarrow = Platform.OS !== 'web' || window.innerWidth <= variables.mobileResponsiveWidthBreakpoint;
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const selectedRouteName = tabState.routes[tabState.index]?.name;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[selectedRouteName ?? ''] ?? NAVIGATION_TABS.HOME;

    const activeRoute = tabState.routes[tabState.index];
    const nestedStateIndex = activeRoute?.state?.index;
    const isAtRoot = nestedStateIndex === undefined || nestedStateIndex === 0;
    const shouldHide = isNarrow && !isAtRoot;

    // Memoize the NavigationTabBar element so that when tabState changes but
    // selectedTab/shouldHide stay the same (e.g. navigation within the same tab),
    // React skips the expensive NavigationTabBar subtree entirely.
    const narrowTabBar = useMemo(
        () => (
            <NavigationTabBar
                selectedTab={selectedTab}
                shouldShowFloatingButtons={!shouldHide}
            />
        ),
        [selectedTab, shouldHide],
    );

    const wideTabBar = useMemo(() => <NavigationTabBar selectedTab={selectedTab} />, [selectedTab]);

    if (isNarrow) {
        return (
            <View
                style={{overflow: 'visible', marginTop: -(variables.bottomTabHeight + safeAreaPaddingBottom), paddingBottom: safeAreaPaddingBottom, opacity: shouldHide ? 0 : 1}}
                pointerEvents={shouldHide ? 'none' : 'auto'}
            >
                {narrowTabBar}
            </View>
        );
    }

    // On wide layout, the bottom tab navigator uses tabBarPosition='left' to place
    // the tab bar on the left side. NavigationTabBar renders as a normal flow element
    // (no position:fixed) so the navigator's flex layout handles positioning.
    return <View style={{overflow: 'visible'}}>{wideTabBar}</View>;
}

// Stable reference: only passes `state` to avoid descriptors thrashing
// eslint-disable-next-line react/jsx-props-no-spreading
const renderTabBar = ({state}: BottomTabBarProps) => <RootTabNavigatorTabBar tabState={state} />;

const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySearchFullscreenNavigator = lazy(() => import('./SearchFullscreenNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));
const LazyWorkspaceSplitNavigator = lazy(() => import('./WorkspaceSplitNavigator'));

function withSuspense<P extends Record<string, unknown>>(LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>) {
    function SuspenseWrapper(props: P) {
        const styles = useThemeStyles();
        return (
            <Suspense
                fallback={
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.appBG]}>
                        <FullScreenLoadingIndicator />
                    </View>
                }
            >
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
const WorkspaceSplitNavigatorScreen = withSuspense(LazyWorkspaceSplitNavigator);

const Tab = createBottomTabNavigator<RootTabNavigatorParamList>();

// Hoisted to module level for stable references — prevents React Navigation from
// rebuilding descriptors on every render.
const SCENE_STYLE = {flex: 1} as const;

const TAB_SCREEN_OPTIONS_NARROW = {
    headerShown: false,
    lazy: true,
    animation: 'none' as const,
    sceneStyle: SCENE_STYLE,
    freezeOnBlur: true,
    tabBarPosition: 'bottom' as const,
} as const;

const TAB_SCREEN_OPTIONS_WIDE = {
    ...TAB_SCREEN_OPTIONS_NARROW,
    tabBarPosition: 'left' as const,
} as const;

function RootTabNavigator() {
    // No hooks — stable screenOptions reference prevents unnecessary descriptor rebuilds.
    // On native: Platform.OS !== 'web' → always TAB_SCREEN_OPTIONS_NARROW (same ref every render).
    // On web: reads window.innerWidth synchronously; parent re-renders on resize propagate here.
    const isWideWeb = Platform.OS === 'web' && window.innerWidth > variables.mobileResponsiveWidthBreakpoint;

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            tabBar={renderTabBar}
            screenOptions={isWideWeb ? TAB_SCREEN_OPTIONS_WIDE : TAB_SCREEN_OPTIONS_NARROW}
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
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                component={WorkspaceSplitNavigatorScreen}
            />
        </Tab.Navigator>
    );
}

export default RootTabNavigator;
