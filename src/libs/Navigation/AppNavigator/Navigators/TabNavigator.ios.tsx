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

import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon, NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';
import type {SkCanvas} from '@shopify/react-native-skia';
import type {ImageSourcePropType} from 'react-native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {BlendMode, ClipOp, FontWeight, ImageFormat, Skia} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

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

/** The account avatar drawn with its label, and the size it came out at. */
type AvatarTabIcon = {uri: string; width: number; height: number};

/** Paints the status dot in the glyph's top right corner, where a native badge would have sat. */
function drawStatusDot(canvas: SkCanvas, glyphRight: number, scale: number, color: string) {
    const radius = variables.nativeTabIconDotRadius * scale;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(glyphRight - radius, radius, radius, paint);
}

/** The label's own face, matching what the bar drew before it became native: Expensify Neue, bold when selected. */
function getLabelFont(isSelected: boolean, scale: number) {
    const typeface = Skia.FontMgr.System().matchFamilyStyle(FontUtils.fontFamily.single.EXP_NEUE.fontFamily, {
        weight: isSelected ? FontWeight.Bold : FontWeight.Normal,
    });
    return Skia.Font(typeface, variables.fontSizeSmall * scale);
}

/**
 * Draws the label under the glyph and reports how much room it took. iOS 26 discards the title color an item
 * appearance carries while honoring its font, and neither `unselectedItemTintColor` nor re-asserting it after
 * layout gets through, so the text is painted into the image the item is handed instead.
 */
function drawLabel(canvas: SkCanvas, label: string, color: string, isSelected: boolean, scale: number, canvasWidth: number, top: number) {
    const font = getLabelFont(isSelected, scale);
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    paint.setAntiAlias(true);
    const width = font.measureText(label).width;
    const metrics = font.getMetrics();
    canvas.drawText(label, (canvasWidth - width) / 2, top - metrics.ascent, paint, font);
}

/** Width and height the label occupies, so a canvas can be sized before anything is drawn into it. */
function measureLabel(label: string, isSelected: boolean, scale: number) {
    const font = getLabelFont(isSelected, scale);
    const metrics = font.getMetrics();
    return {width: font.measureText(label).width, height: metrics.descent - metrics.ascent};
}

/**
 * iOS 26 draws the bar's glass material itself and honors very little of what a tab item is told about its colors.
 * The inactive icon color from `UITabBarItemAppearance` never arrives, and every badge is painted in the color of
 * whichever tab is selected — measured to hold for `badgeBackgroundColor` and for `UITabBarItem.badgeColor` alike.
 * The image handed to an item is honored, though, so the glyph is recolored off-screen and the status dot is drawn
 * into it. Both selection states go through this, because RNScreens rejects a tab whose icon and selectedIcon
 * differ in type. The canvas is the glyph's own size, so Android's fixed icon slot draws the glyph at full size
 * instead of shrinking it to fit reserved room, and the dot overlaps the glyph's top right corner the way the
 * indicator on the mobile web bar does.
 */
async function createTabIcon(
    source: ImageSourcePropType,
    color: string,
    dotColor: string | undefined,
    label: string,
    labelColor: string,
    isSelected: boolean,
): Promise<NativeBottomTabIcon | undefined> {
    const asset = Image.resolveAssetSource(source);
    if (!asset?.uri) {
        return undefined;
    }

    const response = await fetch(asset.uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const scale = asset.scale ?? 1;

    if (!image) {
        return undefined;
    }

    const glyphWidth = image.width();
    const glyphHeight = image.height();
    const gap = variables.nativeTabIconLabelGap * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(glyphWidth, labelSize.width));
    const canvasHeight = Math.ceil(glyphHeight + gap + labelSize.height);
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);

    if (!surface) {
        image.dispose();
        return undefined;
    }

    const paint = Skia.Paint();
    // SrcIn keeps the glyph's alpha and replaces every colored pixel with the theme color.
    paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(color), BlendMode.SrcIn));

    const canvas = surface.getCanvas();
    const glyphLeft = (canvasWidth - glyphWidth) / 2;
    canvas.drawImageRect(image, Skia.XYWHRect(0, 0, glyphWidth, glyphHeight), Skia.XYWHRect(glyphLeft, 0, glyphWidth, glyphHeight), paint);

    if (dotColor) {
        drawStatusDot(canvas, glyphLeft + glyphWidth, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, glyphHeight + gap);

    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return {type: 'image', source: {uri: `data:image/png;base64,${base64}`, width: canvasWidth / scale, height: canvasHeight / scale, scale}, tinted: false};
}

/**
 * The account tab shows the user's avatar, and a tab icon has to be a square image, so the avatar is cropped to a
 * circle off-screen and handed over as a data URI. It fills the same canvas as every other tab icon, so the avatar
 * is drawn at the size of the glyphs next to it.
 */
async function createCircularAvatarIcon(uri: string, dotColor: string | undefined, label: string, labelColor: string, isSelected: boolean): Promise<AvatarTabIcon | undefined> {
    const response = await fetch(uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const scale = variables.nativeTabIconScale;
    const avatarSize = variables.iconBottomBar * scale;
    const gap = variables.nativeTabIconLabelGap * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(avatarSize, labelSize.width));
    const canvasHeight = Math.ceil(avatarSize + gap + labelSize.height);
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const sourceSize = Math.min(image.width(), image.height());
    const sourceX = (image.width() - sourceSize) / 2;
    const sourceY = (image.height() - sourceSize) / 2;
    const avatarLeft = (canvasWidth - avatarSize) / 2;
    const circle = Skia.Path.Make();
    circle.addCircle(avatarLeft + avatarSize / 2, avatarSize / 2, avatarSize / 2);

    const canvas = surface.getCanvas();
    canvas.save();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRect(image, Skia.XYWHRect(sourceX, sourceY, sourceSize, sourceSize), Skia.XYWHRect(avatarLeft, 0, avatarSize, avatarSize), Skia.Paint());
    canvas.restore();

    if (dotColor) {
        drawStatusDot(canvas, avatarLeft + avatarSize, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, avatarSize + gap);

    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    circle.dispose();
    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return {uri: `data:image/png;base64,${base64}`, width: canvasWidth / scale, height: canvasHeight / scale};
}

/**
 * Wraps the tab screens so the floating buttons, the debug view and the wide-layout side bar can be drawn over
 * them. The native bar is part of the navigator itself, so it is switched off through `tabBarStyle` in the
 * navigator's screen options instead of being unmounted.
 */
function NativeTabLayout({children, state}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeRoute) && !isBlockingViewVisible;

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
                // The buttons belong to the bar, so they fade with it rather than appearing in place. UIKit animates
                // the bar itself over roughly the 0.35s it gives every bar, which the FAB's own timing already
                // matches on the way in; it leaves faster so it stops covering the bar that is still sliding out.
                <Animated.View
                    entering={FadeIn.duration(CONST.MODAL.ANIMATION_TIMING.FAB_IN)}
                    exiting={FadeOut.duration(CONST.MODAL.ANIMATION_TIMING.FAB_OUT)}
                    style={styles.nativeTabBarFloatingButtons}
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
    const dotColors: Record<string, string | undefined> = {
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: inboxDotColor,
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: workspacesDotColor,
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: accountDotColor,
    };
    const tabLabels: Record<string, string> = {
        [SCREENS.HOME]: translate('common.home'),
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: translate('common.spend'),
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: translate('common.workspacesTabTitle'),
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: translate('initialSettingsPage.account'),
    };
    // The signature covers everything baked into the bitmaps, so a status that comes or goes, a theme swap or a
    // language change redraws them.
    const iconsSignature = [theme.icon, theme.iconMenu, theme.text, theme.textSupporting, inboxDotColor, workspacesDotColor, accountDotColor, ...Object.values(tabLabels)].join('|');

    const [tintedIcons, setTintedIcons] = useState<{signature: string; icons: Record<string, TintedTabIconPair>}>();
    const tintedIconsForTheme = tintedIcons?.signature === iconsSignature ? tintedIcons.icons : undefined;

    useEffect(() => {
        let isActive = true;
        const inactiveColor = theme.icon;
        const activeColor = theme.iconMenu;
        // The label colors the bar drew before it became native: the supporting tone when idle, the plain text
        // tone when selected. Both come from the theme, so light and dark each get their own pair.
        const inactiveLabelColor = theme.textSupporting;
        const activeLabelColor = theme.text;
        const signature = iconsSignature;

        Promise.all(
            TAB_ICONS.map(([name, source]) =>
                Promise.all([
                    createTabIcon(source, inactiveColor, dotColors[name], tabLabels[name], inactiveLabelColor, false),
                    createTabIcon(source, activeColor, dotColors[name], tabLabels[name], activeLabelColor, true),
                ]).then(([inactive, active]) => ({
                    name,
                    inactive,
                    active,
                })),
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
                setTintedIcons({signature, icons});
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iconsSignature]);

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
    const avatarSignature = `${avatarURI}|${accountDotColor}`;
    const [circularAvatar, setCircularAvatar] = useState<{signature: string; active: AvatarTabIcon; inactive: AvatarTabIcon}>();
    const avatarPair = circularAvatar?.signature === avatarSignature ? circularAvatar : undefined;
    const toAvatarIcon = (icon: AvatarTabIcon): NativeBottomTabIcon => ({
        type: 'image',
        source: {uri: icon.uri, width: icon.width, height: icon.height, scale: variables.nativeTabIconScale},
        tinted: false,
    });

    useEffect(() => {
        let isActive = true;
        if (!avatarURI) {
            return () => {
                isActive = false;
            };
        }

        const signature = avatarSignature;
        const label = tabLabels[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];
        Promise.all([createCircularAvatarIcon(avatarURI, accountDotColor, label, theme.textSupporting, false), createCircularAvatarIcon(avatarURI, accountDotColor, label, theme.text, true)])
            .then(([inactive, active]) => {
                if (!isActive || !inactive || !active) {
                    return;
                }
                setCircularAvatar({signature, active, inactive});
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarSignature, iconsSignature]);

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
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // Pushed through setOptions instead, each tab kept the value it was left with, and the bar spent the first
        // frame after a tab switch in the previous tab's state. The background only lands on Android and iOS 18 and
        // below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar ? ('flex' as const) : ('none' as const), backgroundColor: theme.appBG},
        // Android defaults to showing the label on the selected tab only once a bar has more than three items,
        // which leaves the other tabs centering a lone icon at a different height. Labelling every tab matches
        // what iOS draws and keeps all five icons on one baseline.
        tabBarLabelVisibilityMode: 'labeled' as const,
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
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(SCREENS.HOME, HOME_TAB_ICON)}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, INBOX_TAB_ICON),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SPEND_TAB_ICON)}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.WORKSPACE_NAVIGATOR, WORKSPACES_TAB_ICON),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: avatarPair
                        ? ({focused}: {focused: boolean}) => toAvatarIcon(focused ? avatarPair.active : avatarPair.inactive)
                        : getTabBarIcon(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, ACCOUNT_TAB_ICON),
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
