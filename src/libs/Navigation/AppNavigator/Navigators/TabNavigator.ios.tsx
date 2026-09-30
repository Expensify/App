import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import {nativeBottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import {getAvatarURL} from '@libs/UserAvatarUtils';

import HomePage from '@pages/home/HomePage';

import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas} from '@shopify/react-native-skia';
import type {ImageSourcePropType} from 'react-native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {BlendMode, ClipOp, FontWeight, ImageFormat, Skia} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';

import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import NATIVE_TAB_ICONS from './NativeTabNavigator/NATIVE_TAB_ICONS';
import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import useNativeTabNavigator from './NativeTabNavigator/useNativeTabNavigator';
import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by UITabBar, which brings the liquid glass material with it on iOS 26. Wide layouts keep
 * the JS side bar, since UITabBar cannot be moved to the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

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

/** Every glyph the bar draws, paired with the tab it belongs to so the tinted copies can be looked up again. */
const TAB_ICONS = Object.entries(NATIVE_TAB_ICONS).map(([name, icon]) => [name, icon.source] as const);

const getFloatingButtonsBottom = () => variables.iosNativeTabBarFloatingButtonsBottom;

const renderNativeTabLayout = (props: Omit<NativeTabLayoutProps, 'getFloatingButtonsBottom'>) => (
    <NativeTabLayout
        {...props}
        getFloatingButtonsBottom={getFloatingButtonsBottom}
    />
);

function TabNavigator() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {shouldShowNativeTabBar, inboxDotColor, workspacesDotColor, accountDotColor, tabRouterOverride} = useNativeTabNavigator();
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
    const getTabBarIcon = (name: keyof typeof NATIVE_TAB_ICONS) => {
        const pair = tintedIcons?.icons[name];
        if (!pair) {
            return NATIVE_TAB_ICONS[name];
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
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(SCREENS.HOME)}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.WORKSPACE_NAVIGATOR),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: avatarPair
                        ? ({focused}: {focused: boolean}) => toAvatarIcon(focused ? avatarPair.active : avatarPair.inactive)
                        : getTabBarIcon(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR),
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
