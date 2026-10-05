import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTheme from '@hooks/useTheme';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas} from '@shopify/react-native-skia';

import {FillType, FontWeight, Skia} from '@shopify/react-native-skia';

import type {NativeTabGlyph} from './NATIVE_TAB_GLYPHS';
import type NATIVE_TAB_ICONS from './NATIVE_TAB_ICONS';
import type {TabIconPair} from './tabIconRasterizer';
import type {LastDrawnTabIcons} from './useRasterizedTabIcons';

import NATIVE_TAB_GLYPHS from './NATIVE_TAB_GLYPHS';
import {decodeImage, drawCircularImage, drawTabIconPairs, encodeSurface, getTabBarIcon} from './tabIconRasterizer';
import useRasterizedTabIcons from './useRasterizedTabIcons';

/** The account tab's avatar in both selection states, with the URI it was drawn from. */
type CircularAvatarIcons = TabIconPair & {uri: string};

const lastTintedIcons: LastDrawnTabIcons<Record<string, TabIconPair>> = {};
const lastCircularAvatar: LastDrawnTabIcons<CircularAvatarIcons> = {};

function drawStatusDot(canvas: SkCanvas, glyphRight: number, glyphTop: number, scale: number, color: string) {
    const radius = variables.nativeTabIconDotRadius * scale;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(glyphRight - radius, glyphTop + radius, radius, paint);
}

function drawGlyph(canvas: SkCanvas, glyph: NativeTabGlyph, left: number, top: number, size: number, color: string) {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    paint.setAntiAlias(true);
    const viewBoxScale = size / glyph.viewBoxSize;

    canvas.save();
    canvas.translate(left, top);
    canvas.scale(viewBoxScale, viewBoxScale);
    for (const {d, isEvenOdd} of glyph.paths) {
        const path = Skia.Path.MakeFromSVGString(d);
        if (!path) {
            continue;
        }
        if (isEvenOdd) {
            path.setFillType(FillType.EvenOdd);
        }
        canvas.drawPath(path, paint);
        path.dispose();
    }
    canvas.restore();
}

function getLabelFont(isSelected: boolean, scale: number) {
    const typeface = Skia.FontMgr.System().matchFamilyStyle(FontUtils.fontFamily.single.EXP_NEUE.fontFamily, {
        weight: isSelected ? FontWeight.Bold : FontWeight.Normal,
    });
    return Skia.Font(typeface, variables.fontSizeSmall * scale);
}

/**
 * iOS 26 discards the title color an item appearance carries while honoring its font, and neither
 * `unselectedItemTintColor` nor re-asserting it after layout gets through, so the label is painted into the icon.
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

function measureLabel(label: string, isSelected: boolean, scale: number) {
    const font = getLabelFont(isSelected, scale);
    const metrics = font.getMetrics();
    return {width: font.measureText(label).width, height: metrics.descent - metrics.ascent};
}

/**
 * iOS 26 never applies the inactive icon color from `UITabBarItemAppearance`, and paints every badge in the color of
 * the selected tab (both `badgeBackgroundColor` and `UITabBarItem.badgeColor`), so the glyph is drawn in its color and the
 * status dot drawn into the image. Both selection states go through this, because RNScreens rejects a tab whose
 * icon and selectedIcon differ in type.
 */
async function createTabIcon(
    glyph: NativeTabGlyph,
    color: string,
    dotColor: string | undefined,
    label: string,
    labelColor: string,
    isSelected: boolean,
): Promise<NativeBottomTabIcon | undefined> {
    const scale = variables.nativeTabIconScale;
    const glyphSize = variables.iconNativeTabBarIOS * scale;
    // The account avatar is taller than a glyph, so every glyph sits this far down to share its centre, and
    // every label lands at the same height.
    const glyphTop = ((variables.avatarNativeTabBarIOS - variables.iconNativeTabBarIOS) / 2) * scale;
    const gap = variables.nativeTabIconLabelGap * scale;
    const labelSize = measureLabel(label, isSelected, scale);
    const canvasWidth = Math.ceil(Math.max(glyphSize, labelSize.width));
    const canvasHeight = Math.ceil(glyphTop + glyphSize + gap + labelSize.height);
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);

    if (!surface) {
        return undefined;
    }

    const canvas = surface.getCanvas();
    const glyphLeft = (canvasWidth - glyphSize) / 2;
    drawGlyph(canvas, glyph, glyphLeft, glyphTop, glyphSize, color);

    if (dotColor) {
        drawStatusDot(canvas, glyphLeft + glyphSize, glyphTop, scale, dotColor);
    }

    drawLabel(canvas, label, labelColor, isSelected, scale, canvasWidth, glyphTop + glyphSize + gap);

    return {type: 'image', source: {uri: encodeSurface(surface), width: canvasWidth / scale, height: canvasHeight / scale, scale}, tinted: false};
}

/** A circle reads smaller than a glyph of the same box, so the avatar is drawn a little larger than the glyphs. */
async function createCircularAvatarIcon(uri: string, dotColor: string | undefined, label: string, labelColor: string, isSelected: boolean): Promise<NativeBottomTabIcon | undefined> {
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

    return {type: 'image', source: {uri: encodeSurface(surface), width: canvasWidth / scale, height: canvasHeight / scale, scale}, tinted: false};
}

/**
 * `areTabIconsReady` stays false until the first recolored set exists, because the template icons the bar would
 * fall back to render black on iOS 26, which ignores the inactive tint.
 */
function useIOSTabIcons(dotColors: Record<string, string | undefined>, tabLabels: Record<string, string>) {
    const theme = useTheme();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const accountLabel = tabLabels[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];
    const accountDotColor = dotColors[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];

    // Covers everything baked into the bitmaps, so a status, theme or language change redraws them.
    const iconsSignature = [theme.icon, theme.iconMenu, theme.text, theme.textSupporting, ...Object.values(dotColors), ...Object.values(tabLabels)].join('|');
    // A failed draw still lets the bar show, on the template icons, rather than keeping it hidden.
    const tintedIcons = useRasterizedTabIcons(
        lastTintedIcons,
        iconsSignature,
        () =>
            drawTabIconPairs((name, isSelected) =>
                createTabIcon(
                    NATIVE_TAB_GLYPHS[name],
                    isSelected ? theme.iconMenu : theme.icon,
                    dotColors[name],
                    tabLabels[name],
                    isSelected ? theme.text : theme.textSupporting,
                    isSelected,
                ),
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
    const accountAvatarIcon = avatarPair ? ({focused}: {focused: boolean}) => (focused ? avatarPair.active : avatarPair.inactive) : undefined;

    return {
        getTabBarIcon: (name: keyof typeof NATIVE_TAB_ICONS) => getTabBarIcon(tintedIcons, name),
        accountAvatarIcon,
        areTabIconsReady: !!tintedIcons,
    };
}

export default useIOSTabIcons;
