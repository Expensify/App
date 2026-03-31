/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {findFocusedRoute, useNavigation, useNavigationState} from '@react-navigation/native';
import React, {lazy, Suspense, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion, ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import HomePage from '@pages/home/HomePage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type TAB_SCREENS from './TAB_SCREENS';

const ROUTE_TO_NAVIGATION_TAB: Record<string, ValueOf<typeof NAVIGATION_TABS>> = {
    [SCREENS.HOME]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.INBOX,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: NAVIGATION_TABS.WORKSPACES,
};

/**
 * Custom tab bar rendered by the BottomTabNavigator. Only receives `state` (not the
 * full BottomTabBarProps) to avoid `descriptors` thrashing memoization.
 * Wrapped in overflow:'visible' so floating buttons (FAB, GPS, Camera) aren't clipped.
 */
function TabNavigatorBar({tabState}: {tabState: BottomTabBarProps['state']}) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const selectedRouteName = tabState.routes[tabState.index]?.name;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[selectedRouteName ?? ''] ?? NAVIGATION_TABS.HOME;

    const activeRoute = tabState.routes[tabState.index];
    const nestedStateIndex = activeRoute?.state?.index;
    const isAtRoot = nestedStateIndex === undefined || nestedStateIndex === 0;
    const shouldHide = shouldUseNarrowLayout && !isAtRoot;

    // On native, screens also render the tab bar via bottomContent for swipe-back animations.
    // Delay showing this navigator's tab bar only when navigating back from a deeper screen
    // (where the tab bar was hidden). Keep it visible during tab switches so it doesn't flash.
    const prevTabIndex = usePrevious(tabState.index);
    const prevShouldHide = usePrevious(shouldHide);
    const stateKey = `${tabState.index}-${nestedStateIndex}`;
    const [animationDoneKey, setAnimationDoneKey] = useState(stateKey);

    const tabChanged = prevTabIndex !== tabState.index;
    const shouldApplyDelay = shouldUseNarrowLayout && !tabChanged && prevShouldHide && !shouldHide;

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setAnimationDoneKey(stateKey);
        });
        return () => cancelAnimationFrame(frameId);
    }, [stateKey]);

    const isHidden = shouldHide || (shouldApplyDelay && animationDoneKey !== stateKey);

    if (shouldUseNarrowLayout) {
        // Negative marginTop overlays the tab bar on content (zero flex space) to prevent layout shifts.
        return (
            <View
                style={[StyleUtils.getTabBarNarrowStyle(safeAreaPaddingBottom), isHidden && styles.opacity0]}
                pointerEvents={isHidden ? 'none' : 'auto'}
            >
                <NavigationTabBar
                    selectedTab={selectedTab}
                    shouldShowFloatingButtons={!isHidden}
                />
            </View>
        );
    }

    return (
        <View style={styles.overflowHidden}>
            <NavigationTabBar selectedTab={selectedTab} />
        </View>
    );
}

const renderTabBar = ({state}: BottomTabBarProps) => <TabNavigatorBar tabState={state} />;

const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySearchFullscreenNavigator = lazy(() => import('./SearchFullscreenNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));
const LazyWorkspaceNavigator = lazy(() => import('./WorkspaceNavigator'));

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
const WorkspaceNavigatorScreen = withSuspense(LazyWorkspaceNavigator);

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

// Compile-time checks: TAB_SCREENS and TabNavigatorParamList must stay in sync.
// If a screen is added to one but not the other, one of these assignments will error.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _a: Record<TupleToUnion<typeof TAB_SCREENS>, true> = {} as Record<keyof TabNavigatorParamList, true>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _b: Record<keyof TabNavigatorParamList, true> = {} as Record<TupleToUnion<typeof TAB_SCREENS>, true>;

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded — swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.SETTINGS.ROOT]);

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

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            tabBar={renderTabBar}
            screenOptions={shouldUseNarrowLayout ? TAB_SCREEN_OPTIONS_NARROW : TAB_SCREEN_OPTIONS_WIDE}
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
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigatorScreen}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
