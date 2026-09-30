import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas, SkImage, SkSurface} from '@shopify/react-native-skia';
import type {ImageSourcePropType} from 'react-native';

import {BlendMode, ClipOp, ImageFormat, Skia} from '@shopify/react-native-skia';
import {Image} from 'react-native';

import NATIVE_TAB_ICONS from './NATIVE_TAB_ICONS';

type TabIconPair = {active: NativeBottomTabIcon; inactive: NativeBottomTabIcon};

const TAB_ICONS = Object.entries(NATIVE_TAB_ICONS).map(([name, icon]) => [name, icon.source] as const);

async function decodeImage(uri: string): Promise<SkImage | null> {
    const response = await fetch(uri);
    return Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer())));
}

async function decodeGlyph(source: ImageSourcePropType): Promise<{image: SkImage; scale: number} | undefined> {
    const asset = Image.resolveAssetSource(source);
    if (!asset?.uri) {
        return undefined;
    }
    const image = await decodeImage(asset.uri);
    return image ? {image, scale: asset.scale ?? 1} : undefined;
}

function createTintPaint(color: string) {
    const paint = Skia.Paint();
    paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(color), BlendMode.SrcIn));
    return paint;
}

function drawCircularImage(canvas: SkCanvas, image: SkImage, left: number, top: number, size: number) {
    const sourceSize = Math.min(image.width(), image.height());
    const circle = Skia.Path.Make();
    circle.addCircle(left + size / 2, top + size / 2, size / 2);

    canvas.save();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRect(
        image,
        Skia.XYWHRect((image.width() - sourceSize) / 2, (image.height() - sourceSize) / 2, sourceSize, sourceSize),
        Skia.XYWHRect(left, top, size, size),
        Skia.Paint(),
    );
    canvas.restore();
    circle.dispose();
}

function encodeSurface(surface: SkSurface): string {
    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);
    snapshot.dispose();
    surface.dispose();
    return `data:image/png;base64,${base64}`;
}

async function drawTabIconPairs(
    drawIcon: (name: string, source: ImageSourcePropType, isSelected: boolean) => Promise<NativeBottomTabIcon | undefined>,
): Promise<Record<string, TabIconPair>> {
    const results = await Promise.all(
        TAB_ICONS.map(([name, source]) => Promise.all([drawIcon(name, source, false), drawIcon(name, source, true)]).then(([inactive, active]) => ({name, inactive, active}))),
    );
    const icons: Record<string, TabIconPair> = {};
    for (const result of results) {
        if (result.inactive && result.active) {
            icons[result.name] = {inactive: result.inactive, active: result.active};
        }
    }
    return icons;
}

function getTabBarIcon(icons: Record<string, TabIconPair> | undefined, name: keyof typeof NATIVE_TAB_ICONS) {
    const pair = icons?.[name];
    if (!pair) {
        return NATIVE_TAB_ICONS[name];
    }
    return ({focused}: {focused: boolean}) => (focused ? pair.active : pair.inactive);
}

export {createTintPaint, decodeGlyph, decodeImage, drawCircularImage, drawTabIconPairs, encodeSurface, getTabBarIcon};
export type {TabIconPair};
