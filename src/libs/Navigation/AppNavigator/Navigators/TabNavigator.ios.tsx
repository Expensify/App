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
 * Tab Navigator backed by UITabBar, which brings the liquid glass material with it on iOS 26. Wide layouts keep
 * the JS side bar, since UITabBar cannot be moved to the side of the screen.
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

/** The recolored tab icons, with the signature of everything baked into them. */
type TintedTabIcons = {signature: string; icons: Record<string, TintedTabIconPair>};

/** The account tab's avatar in both selection states, with the signature of everything baked into them. */
type CircularAvatarIcons = {signature: string; uri: string; active: AvatarTabIcon; inactive: AvatarTabIcon};

/**
 * The last icons drawn, kept outside the component so a remounted navigator starts from them instead of waiting
 * for Skia again. While a new theme or language is being drawn, the bar keeps showing these.
 */
let lastTintedIcons: TintedTabIcons | undefined;
let lastCircularAvatar: CircularAvatarIcons | undefined;

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

/** The recolored copies of one tab icon, one per selection state. */
type TintedTabIconPair = {active: NativeBottomTabIcon; inactive: NativeBottomTabIcon};

/** The account avatar drawn with its label, and the size it came out at. */
type AvatarTabIcon = {uri: string; width: number; height: number};

/** Paints the status dot in the glyph's top right corner, where a native badge would have sat. */
function drawStatusDot(canvas: SkCanvas, glyphRight: number, glyphTop: number, scale: number, color: string) {
    const radius = variables.nativeTabIconDotRadius * scale;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(glyphRight - radius, glyphTop + radius, radius, paint);
}

/** The label's face: Expensify Neue, bold when selected. */
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
 * differ in type. The canvas is only as big as what it holds, and the dot overlaps the glyph's top right corner
 * the way the indicator on the JS bar does.
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

    // The glyph assets are 24 pt and are drawn at the floating bar's glyph size, the one the JS bar uses.
    const glyphWidth = variables.iconFloatingTabBar * scale;
    const glyphHeight = variables.iconFloatingTabBar * scale;
    // The account avatar is taller than a glyph, so every glyph sits this far down to share its centre, and
    // every label lands at the same height.
    const glyphTop = ((variables.avatarFloatingTabBar - variables.iconFloatingTabBar) / 2) * scale;
    const gap = variables.nativeTabIconLabelGap * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(glyphWidth, labelSize.width));
    const canvasHeight = Math.ceil(glyphTop + glyphHeight + gap + labelSize.height);
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
    canvas.drawImageRect(image, Skia.XYWHRect(0, 0, image.width(), image.height()), Skia.XYWHRect(glyphLeft, glyphTop, glyphWidth, glyphHeight), paint);

    if (dotColor) {
        drawStatusDot(canvas, glyphLeft + glyphWidth, glyphTop, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, glyphTop + glyphHeight + gap);

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
 * circle off-screen and handed over as a data URI. Its canvas is as tall as every other tab icon's, with the avatar
 * a little larger than the glyphs next to it, since a circle reads smaller than a glyph of the same box.
 */
async function createCircularAvatarIcon(uri: string, dotColor: string | undefined, label: string, labelColor: string, isSelected: boolean): Promise<AvatarTabIcon | undefined> {
    const response = await fetch(uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const scale = variables.nativeTabIconScale;
    const avatarSize = variables.avatarFloatingTabBar * scale;
    // The avatar overhangs a glyph by the same amount above and below, so its gap to the label shrinks by
    // that much and the label lands where every other tab's does.
    const gap = (variables.nativeTabIconLabelGap - (variables.avatarFloatingTabBar - variables.iconFloatingTabBar) / 2) * scale;
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
        drawStatusDot(canvas, avatarLeft + avatarSize, 0, scale, dotColor);
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
function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
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

    const [tintedIcons, setTintedIcons] = useState<TintedTabIcons | undefined>(lastTintedIcons);
    // The template icons the bar would fall back to render black on iOS 26, which ignores the inactive tint, so
    // the bar is held back until the first recolored set exists.
    const areTabIconsReady = !!tintedIcons;

    useEffect(() => {
        let isActive = true;
        const inactiveColor = theme.icon;
        const activeColor = theme.iconMenu;
        // The supporting tone when idle, the plain text tone when selected, taken from the theme so light and dark
        // each get their own pair.
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
                lastTintedIcons = {signature, icons};
                setTintedIcons(lastTintedIcons);
            })
            .catch(() => {
                // A failed draw still lets the bar show, on the template icons, rather than keeping it hidden.
                if (!isActive) {
                    return;
                }
                setTintedIcons((previous) => previous ?? {signature, icons: {}});
            });

        return () => {
            isActive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iconsSignature]);

    /** Falls back to the template icon for a tab whose tinted copies could not be drawn, so it is never left without one. */
    const getTabBarIcon = (name: string, fallbackIcon: NativeBottomTabIcon) => {
        const pair = tintedIcons?.icons[name];
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
    const avatarSignature = [avatarURI, accountDotColor, tabLabels[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR], theme.textSupporting, theme.text].join('|');
    const [circularAvatar, setCircularAvatar] = useState<CircularAvatarIcons | undefined>(lastCircularAvatar);
    // An avatar drawn for another user is never shown, while a stale dot or label is, until the redraw lands.
    const avatarPair = circularAvatar?.uri === avatarURI ? circularAvatar : undefined;
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
                lastCircularAvatar = {signature, uri: avatarURI, active, inactive};
                setCircularAvatar(lastCircularAvatar);
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarSignature]);

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
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // The background only lands on iOS 18 and below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar && areTabIconsReady ? ('flex' as const) : ('none' as const), backgroundColor: theme.appBG},
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
