import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas} from '@shopify/react-native-skia';
import type {ImageSourcePropType} from 'react-native';

import {FontWeight, Skia} from '@shopify/react-native-skia';

import type NATIVE_TAB_ICONS from './NATIVE_TAB_ICONS';
import type {TabIconPair} from './tabIconRasterizer';
import type {LastDrawnTabIcons} from './useRasterizedTabIcons';

import {createTintPaint, decodeGlyph, decodeImage, drawCircularImage, drawTabIconPairs, encodeSurface, getTabBarIcon} from './tabIconRasterizer';
import useRasterizedTabIcons from './useRasterizedTabIcons';

/** The account avatar drawn with its label, and the size it came out at. */
type AvatarTabIcon = {uri: string; width: number; height: number};

/** The account tab's avatar in both selection states, with the URI it was drawn from. */
type CircularAvatarIcons = {uri: string; active: AvatarTabIcon; inactive: AvatarTabIcon};

const lastTintedIcons: LastDrawnTabIcons<Record<string, TabIconPair>> = {};
const lastCircularAvatar: LastDrawnTabIcons<CircularAvatarIcons> = {};

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
    const glyph = await decodeGlyph(source);
    if (!glyph) {
        return undefined;
    }

    const {image, scale} = glyph;
    // The glyph assets are 24 pt and are drawn at the native bar's glyph size.
    const glyphWidth = variables.iconNativeTabBarIOS * scale;
    const glyphHeight = variables.iconNativeTabBarIOS * scale;
    // The account avatar is taller than a glyph, so every glyph sits this far down to share its centre, and
    // every label lands at the same height.
    const glyphTop = ((variables.avatarNativeTabBarIOS - variables.iconNativeTabBarIOS) / 2) * scale;
    const gap = variables.nativeTabIconLabelGap * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(glyphWidth, labelSize.width));
    const canvasHeight = Math.ceil(glyphTop + glyphHeight + gap + labelSize.height);
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);

    if (!surface) {
        image.dispose();
        return undefined;
    }

    const canvas = surface.getCanvas();
    const glyphLeft = (canvasWidth - glyphWidth) / 2;
    canvas.drawImageRect(image, Skia.XYWHRect(0, 0, image.width(), image.height()), Skia.XYWHRect(glyphLeft, glyphTop, glyphWidth, glyphHeight), createTintPaint(color));

    if (dotColor) {
        drawStatusDot(canvas, glyphLeft + glyphWidth, glyphTop, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, glyphTop + glyphHeight + gap);
    image.dispose();

    return {type: 'image', source: {uri: encodeSurface(surface), width: canvasWidth / scale, height: canvasHeight / scale, scale}, tinted: false};
}

/**
 * The account tab shows the user's avatar, and a tab icon has to be a square image, so the avatar is cropped to a
 * circle off-screen and handed over as a data URI. Its canvas is as tall as every other tab icon's, with the avatar
 * a little larger than the glyphs next to it, since a circle reads smaller than a glyph of the same box.
 */
async function createCircularAvatarIcon(uri: string, dotColor: string | undefined, label: string, labelColor: string, isSelected: boolean): Promise<AvatarTabIcon | undefined> {
    const image = await decodeImage(uri);
    const scale = variables.nativeTabIconScale;
    const avatarSize = variables.avatarNativeTabBarIOS * scale;
    // The avatar overhangs a glyph by the same amount above and below, so its gap to the label shrinks by
    // that much and the label lands where every other tab's does.
    const gap = (variables.nativeTabIconLabelGap - (variables.avatarNativeTabBarIOS - variables.iconNativeTabBarIOS) / 2) * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(avatarSize, labelSize.width));
    const canvasHeight = Math.ceil(avatarSize + gap + labelSize.height);
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const avatarLeft = (canvasWidth - avatarSize) / 2;
    const canvas = surface.getCanvas();
    drawCircularImage(canvas, image, avatarLeft, 0, avatarSize);

    if (dotColor) {
        drawStatusDot(canvas, avatarLeft + avatarSize, 0, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, avatarSize + gap);
    image.dispose();

    return {uri: encodeSurface(surface), width: canvasWidth / scale, height: canvasHeight / scale};
}

function toAvatarIcon(icon: AvatarTabIcon): NativeBottomTabIcon {
    return {type: 'image', source: {uri: icon.uri, width: icon.width, height: icon.height, scale: variables.nativeTabIconScale}, tinted: false};
}

/**
 * The icons of the iOS tab bar: each glyph recolored for both selection states with its label and status dot baked
 * in, and the user's avatar on the account tab. `areTabIconsReady` stays false until the first recolored set exists,
 * because the template icons the bar would fall back to render black on iOS 26, which ignores the inactive tint.
 */
function useIOSTabIcons(dotColors: Record<string, string | undefined>) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const tabLabels: Record<string, string> = {
        [SCREENS.HOME]: translate('common.home'),
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: translate('common.spend'),
        [SCREENS.INSIGHTS]: translate('common.insights'),
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: translate('common.workspacesTabTitle'),
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: translate('initialSettingsPage.account'),
    };
    const accountLabel = tabLabels[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];
    const accountDotColor = dotColors[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];

    // The signature covers everything baked into the bitmaps, so a status that comes or goes, a theme swap or a
    // language change redraws them. The label takes the supporting tone when idle and the plain text tone when
    // selected, taken from the theme so light and dark each get their own pair.
    const iconsSignature = [theme.icon, theme.iconMenu, theme.text, theme.textSupporting, ...Object.values(dotColors), ...Object.values(tabLabels)].join('|');
    // A failed draw still lets the bar show, on the template icons, rather than keeping it hidden.
    const tintedIcons = useRasterizedTabIcons(
        lastTintedIcons,
        iconsSignature,
        () =>
            drawTabIconPairs((name, source, isSelected) =>
                createTabIcon(source, isSelected ? theme.iconMenu : theme.icon, dotColors[name], tabLabels[name], isSelected ? theme.text : theme.textSupporting, isSelected),
            ),
        {},
    );

    const avatarSource = getAvatarURL({avatarSource: currentUserPersonalDetails.avatar, accountID: currentUserPersonalDetails.accountID});
    const avatarURI = typeof avatarSource === 'string' ? avatarSource : undefined;
    const avatarSignature = avatarURI && [avatarURI, accountDotColor, accountLabel, theme.textSupporting, theme.text].join('|');
    const circularAvatar = useRasterizedTabIcons(lastCircularAvatar, avatarSignature, () => {
        if (!avatarURI) {
            return Promise.resolve(undefined);
        }
        return Promise.all([
            createCircularAvatarIcon(avatarURI, accountDotColor, accountLabel, theme.textSupporting, false),
            createCircularAvatarIcon(avatarURI, accountDotColor, accountLabel, theme.text, true),
        ]).then(([inactive, active]) => (inactive && active ? {uri: avatarURI, inactive, active} : undefined));
    });

    // An avatar drawn for another user is never shown, while a stale dot or label is, until the redraw lands.
    const avatarPair = circularAvatar?.uri === avatarURI ? circularAvatar : undefined;
    const accountAvatarIcon = avatarPair ? ({focused}: {focused: boolean}) => toAvatarIcon(focused ? avatarPair.active : avatarPair.inactive) : undefined;

    return {
        getTabBarIcon: (name: keyof typeof NATIVE_TAB_ICONS) => getTabBarIcon(tintedIcons, name),
        accountAvatarIcon,
        areTabIconsReady: !!tintedIcons,
    };
}

export default useIOSTabIcons;
