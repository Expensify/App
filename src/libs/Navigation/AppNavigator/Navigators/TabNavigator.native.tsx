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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import {nativeBottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import cancelTabNavigationSpans, {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';
import {getAvatarURL} from '@libs/UserAvatarUtils';

import HomePage from '@pages/home/HomePage';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon, NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';
import type {ImageSourcePropType} from 'react-native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {BlendMode, ClipOp, ImageFormat, Skia} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by the platform's own tab bar: UITabBar on iOS, which brings the liquid glass material
 * with it on iOS 26, and a Material BottomNavigationView on Android. Wide layouts keep the JS side bar, since
 * neither native bar can be moved to the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

/** Template icons, so the selected tab picks up the active color through the bar's own tint. */
const HOME_TAB_ICON = {type: 'image', source: homeIcon} as const satisfies NativeBottomTabIcon;
const INBOX_TAB_ICON = {type: 'image', source: inboxIcon} as const satisfies NativeBottomTabIcon;
const SPEND_TAB_ICON = {type: 'image', source: receiptMultipleIcon} as const satisfies NativeBottomTabIcon;
const WORKSPACES_TAB_ICON = {type: 'image', source: buildingsIcon} as const satisfies NativeBottomTabIcon;
const ACCOUNT_TAB_ICON = {type: 'image', source: profileIcon} as const satisfies NativeBottomTabIcon;

/** Every template icon the bar draws, paired with the tab it belongs to so the tinted copies can be looked up again. */
const TAB_ICONS = [
    [SCREENS.HOME, homeIcon],
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, inboxIcon],
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, receiptMultipleIcon],
    [NAVIGATORS.WORKSPACE_NAVIGATOR, buildingsIcon],
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, profileIcon],
] as const;

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

/** The recolored copies of one tab icon, one per selection state. */
type TintedTabIconPair = {active: NativeBottomTabIcon; inactive: NativeBottomTabIcon};

/**
 * iOS 26 draws the bar's glass material itself and ignores the per-item `UITabBarItemAppearance`, so the inactive
 * icon color never reaches an unselected template icon — it lands on the system label color instead. Recoloring the
 * icon off-screen and handing it over as an opaque image is the only way to keep the theme's icon color there.
 * Both selection states go through this, because RNScreens rejects a tab whose icon and selectedIcon differ in type.
 */
async function createTintedIcon(source: ImageSourcePropType, color: string): Promise<NativeBottomTabIcon | undefined> {
    const asset = Image.resolveAssetSource(source);
    if (!asset?.uri) {
        return undefined;
    }

    const response = await fetch(asset.uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const surface = image ? Skia.Surface.MakeOffscreen(image.width(), image.height()) : null;

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const bounds = Skia.XYWHRect(0, 0, image.width(), image.height());
    const paint = Skia.Paint();
    // SrcIn keeps the glyph's alpha and replaces every colored pixel with the theme color.
    paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(color), BlendMode.SrcIn));
    surface.getCanvas().drawImageRect(image, bounds, bounds, paint);
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return {type: 'image', source: {uri: `data:image/png;base64,${base64}`, width: asset.width, height: asset.height, scale: asset.scale}, tinted: false};
}

/**
 * The account tab shows the user's avatar, and a tab icon has to be a square image, so the avatar is cropped to a
 * circle off-screen and handed over as a data URI.
 */
async function createCircularAvatarIcon(uri: string): Promise<string | undefined> {
    const response = await fetch(uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const iconSize = variables.iconBottomBar * 3;
    const surface = Skia.Surface.MakeOffscreen(iconSize, iconSize);

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const sourceSize = Math.min(image.width(), image.height());
    const sourceX = (image.width() - sourceSize) / 2;
    const sourceY = (image.height() - sourceSize) / 2;
    const circle = Skia.Path.Make();
    circle.addCircle(iconSize / 2, iconSize / 2, iconSize / 2);

    const canvas = surface.getCanvas();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRect(image, Skia.XYWHRect(sourceX, sourceY, sourceSize, sourceSize), Skia.XYWHRect(0, 0, iconSize, iconSize), Skia.Paint());
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    circle.dispose();
    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return `data:image/png;base64,${base64}`;
}

/**
 * Wraps the tab screens so the floating buttons, the debug view and the wide-layout side bar can be drawn over
 * them. The native bar is part of the navigator itself, so it is switched off through the active tab's options
 * instead of being unmounted.
 */
function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const theme = useTheme();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeRoute) && !isBlockingViewVisible;
    const activeTabNavigation = activeRoute ? descriptors[activeRoute.key]?.navigation : undefined;

    // setOptions replaces tabBarStyle wholesale, so the background travels with the visibility flag. The
    // background only lands on Android and iOS 18 and below; iOS 26 keeps its own glass material.
    useEffect(() => {
        activeTabNavigation?.setOptions({tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.appBG}});
    }, [activeTabNavigation, shouldShowNativeTabBar, theme.appBG]);

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
                <View
                    style={styles.nativeTabBarFloatingButtons}
                    pointerEvents="box-none"
                >
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton />
                </View>
            )}
        </View>
    );
}

const renderNativeTabLayout = (props: NativeTabLayoutProps) => <NativeTabLayout {...props} />;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {indicatorColor: accountIndicatorColor, status: accountIndicatorStatus} = useAccountTabIndicatorStatus();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because TabNavigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRouteName = isRealizedNavigationState(tabState) ? tabState.routes[tabState.index]?.name : SCREENS.HOME;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeTabRouteName ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;

    const [tintedIcons, setTintedIcons] = useState<{inactiveColor: string; activeColor: string; icons: Record<string, TintedTabIconPair>}>();
    const tintedIconsForTheme = tintedIcons?.inactiveColor === theme.icon && tintedIcons.activeColor === theme.iconMenu ? tintedIcons.icons : undefined;

    useEffect(() => {
        let isActive = true;
        const inactiveColor = theme.icon;
        const activeColor = theme.iconMenu;

        Promise.all(
            TAB_ICONS.map(([name, source]) =>
                Promise.all([createTintedIcon(source, inactiveColor), createTintedIcon(source, activeColor)]).then(([inactive, active]) => ({name, inactive, active})),
            ),
        )
            .then((results) => {
                if (!isActive) {
                    return;
                }
                const icons: Record<string, TintedTabIconPair> = {};
                for (const result of results) {
                    if (result.inactive && result.active) {
                        icons[result.name] = {inactive: result.inactive, active: result.active};
                    }
                }
                setTintedIcons({inactiveColor, activeColor, icons});
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, [theme.icon, theme.iconMenu]);

    /** Falls back to the template icon until both tinted copies are ready, so a tab is never left without one. */
    const getTabBarIcon = (name: string, fallbackIcon: NativeBottomTabIcon) => {
        const pair = tintedIconsForTheme?.[name];
        if (!pair) {
            return fallbackIcon;
        }
        return ({focused}: {focused: boolean}) => (focused ? pair.active : pair.inactive);
    };

    const avatarSource = getAvatarURL({
        avatarSource: currentUserPersonalDetails.avatar,
        accountID: currentUserPersonalDetails.accountID,
    });
    const avatarURI = typeof avatarSource === 'string' ? avatarSource : undefined;
    const [circularAvatar, setCircularAvatar] = useState<{source: string; uri: string}>();
    const circularAvatarURI = circularAvatar && circularAvatar.source === avatarURI ? circularAvatar.uri : undefined;
    const accountTabIcon: NativeBottomTabIcon = circularAvatarURI
        ? {type: 'image', source: {uri: circularAvatarURI, width: variables.iconBottomBar, height: variables.iconBottomBar, scale: 3}, tinted: false}
        : ACCOUNT_TAB_ICON;

    useEffect(() => {
        let isActive = true;
        if (!avatarURI) {
            return () => {
                isActive = false;
            };
        }

        createCircularAvatarIcon(avatarURI)
            .then((result) => {
                if (!isActive || !result) {
                    return;
                }
                setCircularAvatar({source: avatarURI, uri: result});
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, [avatarURI]);

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

    const screenOptions = {
        headerShown: false,
        // The native bar swaps the visible tab itself, so a tab that mounts on first focus hands the bar an empty
        // container to show while its tree renders. Unfocused tabs render through a transition instead, which keeps
        // them off the first paint and still leaves each one ready to draw its own skeleton the moment it is picked.
        lazy: false,
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        tabBarControllerMode: 'tabBar' as const,
        // The bar stays put while the content scrolls, instead of collapsing the way iOS 26 does by default.
        tabBarMinimizeBehavior: 'none' as const,
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
                options={{tabBarLabel: translate('common.home'), tabBarIcon: getTabBarIcon(SCREENS.HOME, HOME_TAB_ICON)}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: translate('common.inbox'),
                    tabBarIcon: getTabBarIcon(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, INBOX_TAB_ICON),
                    tabBarBadge: chatTabBrickRoad ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: translate('common.spend'), tabBarIcon: getTabBarIcon(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SPEND_TAB_ICON)}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: translate('common.workspacesTabTitle'),
                    tabBarIcon: getTabBarIcon(NAVIGATORS.WORKSPACE_NAVIGATOR, WORKSPACES_TAB_ICON),
                    tabBarBadge: workspacesIndicatorStatus ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: workspacesIndicatorColor},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: translate('initialSettingsPage.account'),
                    tabBarIcon: circularAvatarURI ? accountTabIcon : getTabBarIcon(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, accountTabIcon),
                    tabBarBadge: accountIndicatorStatus ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: accountIndicatorColor},
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
