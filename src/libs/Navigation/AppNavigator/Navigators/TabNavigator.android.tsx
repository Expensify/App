import buildingsIcon from '@assets/images/native-tab-icons/buildings.png';
import homeIcon from '@assets/images/native-tab-icons/home.png';
import inboxIcon from '@assets/images/native-tab-icons/inbox.png';
import profileIcon from '@assets/images/native-tab-icons/profile.png';
import receiptMultipleIcon from '@assets/images/native-tab-icons/receipt-multiple.png';

import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import DebugTabView from '@components/Navigation/DebugTabView';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import {nativeBottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import cancelTabNavigationSpans, {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';

import HomePage from '@pages/home/HomePage';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon, NativeBottomTabNavigationOptions, NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by Material's BottomNavigationView, with the Material 3 active indicator pill, ripples, and
 * Material badges for the status dots. Wide layouts keep the JS side bar, since the native bar cannot be moved to
 * the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

/**
 * Plain glyphs, recolored by the bar's own icon tint for both selection states. The account tab uses the profile
 * glyph rather than the avatar, because Android tints every tab icon and would flatten a photo to a silhouette.
 */
const HOME_TAB_ICON = {type: 'image', source: homeIcon} as const satisfies NativeBottomTabIcon;
const INBOX_TAB_ICON = {type: 'image', source: inboxIcon} as const satisfies NativeBottomTabIcon;
const SPEND_TAB_ICON = {type: 'image', source: receiptMultipleIcon} as const satisfies NativeBottomTabIcon;
const WORKSPACES_TAB_ICON = {type: 'image', source: buildingsIcon} as const satisfies NativeBottomTabIcon;
const ACCOUNT_TAB_ICON = {type: 'image', source: profileIcon} as const satisfies NativeBottomTabIcon;

/** An empty badge value makes Material draw its small dot badge instead of a number. */
const STATUS_DOT_BADGE = '';

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded — swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.SETTINGS.ROOT]);

type NativeTabLayoutProps = Parameters<NonNullable<NativeBottomTabNavigatorProps['layout']>>[0];

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

/** Shows a status as a Material dot badge in its own color, or no badge at all. */
function getStatusBadgeOptions(dotColor: string | undefined): Pick<NativeBottomTabNavigationOptions, 'tabBarBadge' | 'tabBarBadgeStyle'> {
    if (!dotColor) {
        return {tabBarBadge: undefined};
    }
    return {tabBarBadge: STATUS_DOT_BADGE, tabBarBadgeStyle: {backgroundColor: dotColor}};
}

/**
 * Wraps the tab screens so the floating buttons, the debug view and the wide-layout side bar can be drawn over
 * them. The native bar is part of the navigator itself, so it is switched off through `tabBarStyle` in the
 * navigator's screen options instead of being unmounted.
 */
function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    // The buttons follow whatever the navigator decided for the bar itself.
    const shouldShowNativeTabBar = shouldUseNarrowLayout && !!activeRoute && descriptors[activeRoute.key]?.options.tabBarStyle?.display !== 'none';

    if (!shouldUseNarrowLayout) {
        return (
            <View style={[styles.flex1, styles.flexRow]}>
                <View
                    style={styles.tabNavigatorBarContainer}
                    pointerEvents="box-none"
                >
                    <NavigationTabBar selectedTab={selectedTab} />
                </View>
                <View style={styles.flex1}>{children}</View>
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            {children}
            {!!isDebugModeEnabled && shouldShowNativeTabBar && <DebugTabView selectedTab={selectedTab} />}
            {shouldShowNativeTabBar && (
                <Animated.View
                    entering={FadeIn.duration(CONST.MODAL.ANIMATION_TIMING.FAB_IN)}
                    exiting={FadeOut.duration(CONST.MODAL.ANIMATION_TIMING.FAB_OUT)}
                    style={styles.nativeAndroidTabBarFloatingButtons(bottomInset)}
                    pointerEvents="box-none"
                >
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton />
                </Animated.View>
            )}
        </View>
    );
}

const renderNativeTabLayout = (props: NativeTabLayoutProps) => <NativeTabLayout {...props} />;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {indicatorColor: accountIndicatorColor, status: accountIndicatorStatus} = useAccountTabIndicatorStatus();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because TabNavigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRoute = isRealizedNavigationState(tabState) ? tabState.routes[tabState.index] : undefined;
    const activeTabRouteName = isRealizedNavigationState(tabState) ? activeTabRoute?.name : SCREENS.HOME;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeTabRouteName ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeTabRoute) && !isBlockingViewVisible;

    let inboxDotColor: string | undefined;
    if (chatTabBrickRoad) {
        inboxDotColor = chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger;
    }
    const workspacesDotColor = workspacesIndicatorStatus ? workspacesIndicatorColor : undefined;
    const accountDotColor = accountIndicatorStatus ? accountIndicatorColor : undefined;

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    useEffect(() => {
        if (!isRealizedNavigationState(tabState)) {
            return;
        }
        setPreservedNavigatorState(route.key, tabState);
    }, [tabState, route.key]);

    // Cancel any in-flight tab-navigation span that doesn't match the new focused tab.
    // The span for the new tab is started by the tab button before navigation, so we keep it via `except`.
    useEffect(() => {
        let spans;
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            spans = INBOX_TAB_SPAN_IDS;
        } else if (selectedTab === NAVIGATION_TABS.SEARCH) {
            spans = REPORTS_TAB_SPAN_IDS;
        }
        cancelTabNavigationSpans(spans);
    }, [selectedTab]);

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

    // Colors and the label face come from the Expensify theme and match the side bar on wide layouts: the
    // selected tab has the menu icon color and a bold label in the regular text color, the others the plain icon
    // color and a supporting text label. The bar takes the raised surface tone with no top border.
    const screenOptions = {
        headerShown: false,
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        tabBarActiveLabelColor: theme.text,
        tabBarInactiveLabelColor: theme.textSupporting,
        tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontSize: styles.textSmall.fontSize},
        tabBarActiveIndicatorColor: theme.androidTabBarActiveIndicatorBG,
        tabBarLabelVisibilityMode: 'labeled' as const,
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        tabBarStyle: {display: shouldShowNativeTabBar ? ('flex' as const) : ('none' as const), backgroundColor: theme.highlightBG},
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenLayout={nativeBottomTabScreenLayoutWrapper}
            screenOptions={screenOptions}
            UNSTABLE_router={tabRouterOverride}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={{tabBarLabel: translate('common.home'), tabBarIcon: HOME_TAB_ICON}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{tabBarLabel: translate('common.inbox'), tabBarIcon: INBOX_TAB_ICON, ...getStatusBadgeOptions(inboxDotColor)}}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: translate('common.spend'), tabBarIcon: SPEND_TAB_ICON}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{tabBarLabel: translate('common.workspacesTabTitle'), tabBarIcon: WORKSPACES_TAB_ICON, ...getStatusBadgeOptions(workspacesDotColor)}}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{tabBarLabel: translate('initialSettingsPage.account'), tabBarIcon: ACCOUNT_TAB_ICON, ...getStatusBadgeOptions(accountDotColor)}}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
