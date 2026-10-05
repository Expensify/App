import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTheme from '@hooks/useTheme';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import variables from '@styles/variables';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {ImageSourcePropType} from 'react-native';

import {Skia} from '@shopify/react-native-skia';

import type {TabIconPair} from './tabIconRasterizer';
import type {LastDrawnTabIcons} from './useRasterizedTabIcons';

import NATIVE_TAB_ICONS from './NATIVE_TAB_ICONS';
import {createTintPaint, decodeGlyph, decodeImage, drawCircularImage, drawTabIconPairs, encodeSurface, getTabBarIcon} from './tabIconRasterizer';
import useRasterizedTabIcons from './useRasterizedTabIcons';

const lastTintedIcons: LastDrawnTabIcons<Record<string, TabIconPair>> = {};
const lastCircularAvatar: LastDrawnTabIcons<{uri: string; icon: NativeBottomTabIcon}> = {};

/**
 * Material draws the icons without a tint (react-native-screens patch 003), so each glyph is recolored here. The
 * canvas is the glyph's own size, so Android's fixed icon slot draws it at full size.
 */
async function createTintedGlyph(source: ImageSourcePropType, color: string): Promise<NativeBottomTabIcon | undefined> {
    const glyph = await decodeGlyph(source);
    if (!glyph) {
        return undefined;
    }

    const {image, scale} = glyph;
    const canvasWidth = image.width();
    const canvasHeight = image.height();
    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);
    if (!surface) {
        image.dispose();
        return undefined;
    }

    const rect = Skia.XYWHRect(0, 0, canvasWidth, canvasHeight);
    surface.getCanvas().drawImageRect(image, rect, rect, createTintPaint(color));
    image.dispose();

    return {type: 'image', source: {uri: encodeSurface(surface), width: canvasWidth / scale, height: canvasHeight / scale, scale}};
}

/** The active indicator pill marks the selected tab, so one image serves both selection states. */
async function createCircularAvatarIcon(uri: string): Promise<NativeBottomTabIcon | undefined> {
    const image = await decodeImage(uri);
    const scale = variables.nativeTabIconScale;
    const canvasSize = variables.iconBottomBar * scale;
    const surface = image ? Skia.Surface.MakeOffscreen(canvasSize, canvasSize) : null;

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    drawCircularImage(surface.getCanvas(), image, 0, 0, canvasSize);
    image.dispose();

    return {type: 'image', source: {uri: encodeSurface(surface), width: variables.iconBottomBar, height: variables.iconBottomBar, scale}};
}

/** `areTabIconsReady` stays false until the first recolored set exists, because the plain glyphs draw black. */
function useAndroidTabIcons() {
    const theme = useTheme();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const inactiveColor = theme.icon;
    const activeColor = theme.iconMenu;

    // A failed draw still lets the bar show, on the plain black glyphs, rather than keeping it hidden.
    const tintedIcons = useRasterizedTabIcons(
        lastTintedIcons,
        [inactiveColor, activeColor].join('|'),
        () => drawTabIconPairs((name, isSelected) => createTintedGlyph(NATIVE_TAB_ICONS[name].source, isSelected ? activeColor : inactiveColor)),
        {},
    );

    const avatarSource = getAvatarURL({avatarSource: currentUserPersonalDetails.avatar, accountID: currentUserPersonalDetails.accountID});
    const avatarURI = typeof avatarSource === 'string' ? avatarSource : undefined;
    const circularAvatar = useRasterizedTabIcons(lastCircularAvatar, avatarURI, (uri) => createCircularAvatarIcon(uri).then((icon) => icon && {uri, icon}));

    // An avatar drawn for another user is never shown; until the current one is drawn, the account glyph stands in.
    const avatarIcon = circularAvatar?.uri === avatarURI ? circularAvatar?.icon : undefined;
    // A function, because React Navigation derives the selected icon only from a function.
    const accountAvatarIcon = avatarIcon ? () => avatarIcon : undefined;

    return {
        getTabBarIcon: (name: keyof typeof NATIVE_TAB_ICONS) => getTabBarIcon(tintedIcons, name),
        accountAvatarIcon,
        areTabIconsReady: !!tintedIcons,
    };
}

export default useAndroidTabIcons;
