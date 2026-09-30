import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTheme from '@hooks/useTheme';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import variables from '@styles/variables';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {ImageSourcePropType} from 'react-native';

import {BlendMode, ClipOp, ImageFormat, Skia} from '@shopify/react-native-skia';
import {useEffect, useState} from 'react';
import {Image} from 'react-native';

import NATIVE_TAB_ICONS from './NATIVE_TAB_ICONS';

/** The recolored copies of one glyph, one per selection state. */
type TintedTabIconPair = {active: NativeBottomTabIcon; inactive: NativeBottomTabIcon};

/** The recolored glyphs, with the signature of the colors baked into them. */
type TintedTabIcons = {signature: string; icons: Record<string, TintedTabIconPair>};

/** The account avatar cropped to a circle, with the URI it was drawn from. */
type CircularAvatarIcon = {uri: string; icon: NativeBottomTabIcon};

/**
 * The last icons drawn, kept outside the hook so a remounted navigator starts from them instead of waiting for
 * Skia again.
 */
let lastTintedIcons: TintedTabIcons | undefined;
let lastCircularAvatar: CircularAvatarIcon | undefined;

/** Every glyph the bar draws, paired with the tab it belongs to so the tinted copies can be looked up again. */
const TAB_ICONS = Object.entries(NATIVE_TAB_ICONS).map(([name, icon]) => [name, icon.source] as const);

/**
 * Material draws the icons without a tint (react-native-screens patch 003), so each glyph is recolored off-screen
 * in the theme color of its selection state. The canvas is the glyph's own size, so Android's fixed icon slot
 * draws it at full size.
 */
async function createTintedGlyph(source: ImageSourcePropType, color: string): Promise<NativeBottomTabIcon | undefined> {
    const asset = Image.resolveAssetSource(source);
    if (!asset?.uri) {
        return undefined;
    }

    const response = await fetch(asset.uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const scale = asset.scale ?? 1;
    const canvasWidth = image?.width() ?? 0;
    const canvasHeight = image?.height() ?? 0;
    const surface = image ? Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight) : null;

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const paint = Skia.Paint();
    // SrcIn keeps the glyph's alpha and replaces every colored pixel with the theme color.
    paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(color), BlendMode.SrcIn));
    surface.getCanvas().drawImageRect(image, Skia.XYWHRect(0, 0, canvasWidth, canvasHeight), Skia.XYWHRect(0, 0, canvasWidth, canvasHeight), paint);
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return {type: 'image', source: {uri: `data:image/png;base64,${base64}`, width: canvasWidth / scale, height: canvasHeight / scale, scale}};
}

/**
 * The account tab shows the user's avatar, and a tab icon has to be a square image, so the avatar is cropped to a
 * circle off-screen and handed over as a data URI, at the size of the glyphs next to it. The selected tab is
 * marked by the active indicator pill, so one image serves both selection states.
 */
async function createCircularAvatarIcon(uri: string): Promise<NativeBottomTabIcon | undefined> {
    const response = await fetch(uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const scale = variables.nativeTabIconScale;
    const canvasSize = variables.iconBottomBar * scale;
    const surface = Skia.Surface.MakeOffscreen(canvasSize, canvasSize);

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const sourceSize = Math.min(image.width(), image.height());
    const sourceX = (image.width() - sourceSize) / 2;
    const sourceY = (image.height() - sourceSize) / 2;
    const circle = Skia.Path.Make();
    circle.addCircle(canvasSize / 2, canvasSize / 2, canvasSize / 2);

    const canvas = surface.getCanvas();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRect(image, Skia.XYWHRect(sourceX, sourceY, sourceSize, sourceSize), Skia.XYWHRect(0, 0, canvasSize, canvasSize), Skia.Paint());
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    circle.dispose();
    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return {type: 'image', source: {uri: `data:image/png;base64,${base64}`, width: variables.iconBottomBar, height: variables.iconBottomBar, scale}};
}

/**
 * The icons of the Android tab bar: each glyph recolored for both selection states, and the user's avatar on the
 * account tab. `areTabIconsReady` stays false until the first recolored set exists, because the plain black glyphs
 * would draw black.
 */
function useAndroidTabIcons() {
    const theme = useTheme();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const inactiveColor = theme.icon;
    const activeColor = theme.iconMenu;
    const iconsSignature = [inactiveColor, activeColor].join('|');
    const [tintedIcons, setTintedIcons] = useState<TintedTabIcons | undefined>(lastTintedIcons);

    const avatarSource = getAvatarURL({avatarSource: currentUserPersonalDetails.avatar, accountID: currentUserPersonalDetails.accountID});
    const avatarURI = typeof avatarSource === 'string' ? avatarSource : undefined;
    const [circularAvatar, setCircularAvatar] = useState<CircularAvatarIcon | undefined>(lastCircularAvatar);

    useEffect(() => {
        let isActive = true;
        const signature = iconsSignature;

        Promise.all(
            TAB_ICONS.map(([name, source]) =>
                Promise.all([createTintedGlyph(source, inactiveColor), createTintedGlyph(source, activeColor)]).then(([inactive, active]) => ({name, inactive, active})),
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
                // A failed draw still lets the bar show, on the plain black glyphs, rather than keeping it hidden.
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

    useEffect(() => {
        let isActive = true;
        if (!avatarURI) {
            return () => {
                isActive = false;
            };
        }

        createCircularAvatarIcon(avatarURI)
            .then((icon) => {
                if (!isActive || !icon) {
                    return;
                }
                lastCircularAvatar = {uri: avatarURI, icon};
                setCircularAvatar(lastCircularAvatar);
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, [avatarURI]);

    /** Falls back to the plain black glyph for a tab whose recolored copies could not be drawn. */
    const getTabBarIcon = (name: keyof typeof NATIVE_TAB_ICONS) => {
        const pair = tintedIcons?.icons[name];
        if (!pair) {
            return NATIVE_TAB_ICONS[name];
        }
        return ({focused}: {focused: boolean}) => (focused ? pair.active : pair.inactive);
    };

    // An avatar drawn for another user is never shown; until the current one is drawn, the account glyph stands in.
    const accountAvatarIcon = circularAvatar?.uri === avatarURI ? circularAvatar?.icon : undefined;

    return {getTabBarIcon, accountAvatarIcon, areTabIconsReady: !!tintedIcons};
}

export default useAndroidTabIcons;
