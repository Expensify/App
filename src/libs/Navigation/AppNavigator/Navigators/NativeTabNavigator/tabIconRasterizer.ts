import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import type {NativeBottomTabIcon, NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas, SkImage, SkParagraph, SkPath} from '@shopify/react-native-skia';

import {BlendMode, ClipOp, FillType, FilterMode, FontWeight, ImageFormat, MipmapMode, Skia, TextAlign} from '@shopify/react-native-skia';
import {PixelRatio} from 'react-native';

import type {NativeTabGlyph, NativeTabName} from './NATIVE_TAB_GLYPHS';
import type {TabAvatarImage} from './useTabAvatarImage';

import NATIVE_TAB_GLYPHS from './NATIVE_TAB_GLYPHS';

type TabIconLayout = {
    /** Side of a glyph's box. */
    glyphSize: number;
    /** Side of the account avatar's box. */
    avatarSize: number;
    /** Whether the label is drawn under the glyph or beside it, as UIKit lays out a tab in landscape. */
    direction: 'stacked' | 'inline';
};

type TabIconLabel = {
    text: string;
    color: string;
    isBold: boolean;
    fontSize: number;
    /** Gap between the glyph box and the label. */
    gap: number;
    /** Width of the tab's slot in the bar, past which the label is truncated with an ellipsis. */
    maxWidth: number;
};

type TabIconEmojiStatus = {
    emoji: string;
    backgroundColor: string;
};

type TabIconParams = {
    /** The glyph drawn unless an avatar is given. */
    name: NativeTabName;
    color: string;
    avatar?: TabAvatarImage;
    dotColor?: string;
    /** The user's status emoji, badged on the account icon as the JS tab bar does. */
    emojiStatus?: TabIconEmojiStatus;
    label?: TabIconLabel;
};

/** Upper bound on cached icons, enough for every tab in both selection states across a few status and theme changes. */
const MAX_CACHED_ICONS = 64;

const iconCache = new Map<string, NativeBottomTabIcon | undefined>();
const glyphPathCache = new Map<NativeTabName, SkPath[]>();

function getGlyphPaths(name: NativeTabName): SkPath[] {
    const cachedPaths = glyphPathCache.get(name);
    if (cachedPaths) {
        return cachedPaths;
    }
    const paths: SkPath[] = [];
    const glyph: NativeTabGlyph = NATIVE_TAB_GLYPHS[name];
    for (const {d, isEvenOdd} of glyph.paths) {
        const path = Skia.Path.MakeFromSVGString(d);
        if (!path) {
            continue;
        }
        if (isEvenOdd) {
            path.setFillType(FillType.EvenOdd);
        }
        paths.push(path);
    }
    glyphPathCache.set(name, paths);
    return paths;
}

/** A paragraph rather than a single font, because only a paragraph falls back to a system font for scripts Expensify Neue lacks. */
function makeLabelParagraph({text, color, isBold, fontSize, maxWidth}: TabIconLabel, scale: number): SkParagraph {
    const paragraph = Skia.ParagraphBuilder.Make({maxLines: 1, ellipsis: '…', textAlign: TextAlign.Left})
        .pushStyle({
            color: Skia.Color(color),
            fontFamilies: [FontUtils.fontFamily.single.EXP_NEUE.fontFamily],
            fontSize: fontSize * scale,
            fontStyle: {weight: isBold ? FontWeight.Bold : FontWeight.Normal},
        })
        .addText(text)
        .build();
    paragraph.layout(maxWidth * scale);
    return paragraph;
}

function drawGlyph(canvas: SkCanvas, name: NativeTabName, left: number, top: number, size: number, color: string) {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    paint.setAntiAlias(true);
    const viewBoxScale = size / NATIVE_TAB_GLYPHS[name].viewBoxSize;

    canvas.save();
    canvas.translate(left, top);
    canvas.scale(viewBoxScale, viewBoxScale);
    for (const path of getGlyphPaths(name)) {
        canvas.drawPath(path, paint);
    }
    canvas.restore();
    paint.dispose();
}

function drawCircularImage(canvas: SkCanvas, image: SkImage, left: number, top: number, size: number) {
    const sourceSize = Math.min(image.width(), image.height());
    const circle = Skia.Path.Make();
    circle.addCircle(left + size / 2, top + size / 2, size / 2);
    const paint = Skia.Paint();

    canvas.save();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRectOptions(
        image,
        Skia.XYWHRect((image.width() - sourceSize) / 2, (image.height() - sourceSize) / 2, sourceSize, sourceSize),
        Skia.XYWHRect(left, top, size, size),
        FilterMode.Linear,
        MipmapMode.Linear,
        paint,
    );
    canvas.restore();
    paint.dispose();
    circle.dispose();
}

/** A cutout rather than a border in the bar's color, because the iOS 26 bar is glass and has no single color. */
function drawStatusDot(canvas: SkCanvas, right: number, top: number, scale: number, color: string) {
    const radius = variables.nativeTabIconDotRadius * scale;
    const centerX = right - radius;
    const centerY = top + radius;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setBlendMode(BlendMode.Clear);
    canvas.drawCircle(centerX, centerY, radius + variables.nativeTabIconDotCutout * scale, paint);
    paint.setBlendMode(BlendMode.SrcOver);
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(centerX, centerY, radius, paint);
    paint.dispose();
}

/** Drawn inside the content box, opposite the status dot, because anything past the canvas is cut off. */
function drawEmojiStatus(canvas: SkCanvas, right: number, bottom: number, scale: number, {emoji, backgroundColor}: TabIconEmojiStatus) {
    const radius = variables.nativeTabIconEmojiStatusRadius * scale;
    const centerX = right - radius;
    const centerY = bottom - radius;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setBlendMode(BlendMode.Clear);
    canvas.drawCircle(centerX, centerY, radius + variables.nativeTabIconDotCutout * scale, paint);
    paint.setBlendMode(BlendMode.SrcOver);
    paint.setColor(Skia.Color(backgroundColor));
    canvas.drawCircle(centerX, centerY, radius, paint);
    paint.dispose();

    // A paragraph, so the emoji falls back to the system's color emoji font.
    const paragraph = Skia.ParagraphBuilder.Make({maxLines: 1, textAlign: TextAlign.Center})
        .pushStyle({fontSize: variables.nativeTabIconEmojiStatusFontSize * scale})
        .addText(emoji)
        .build();
    paragraph.layout(radius * 2);
    paragraph.paint(canvas, centerX - radius, centerY - paragraph.getHeight() / 2);
    paragraph.dispose();
}

type TabIconFrame = {
    canvasWidth: number;
    canvasHeight: number;
    contentLeft: number;
    contentTop: number;
    labelLeft: number;
    labelTop: number;
};

/**
 * With a label, every tab gives its glyph or avatar a box as big as the avatar, so glyphs and the avatar share a centre
 * and every label starts at the same place: under that box, or beside it in landscape.
 */
function getTabIconFrame(layout: TabIconLayout, contentSize: number, labelGap: number, labelWidth: number, labelHeight: number, hasLabel: boolean, scale: number): TabIconFrame {
    const boxSize = hasLabel ? Math.max(layout.glyphSize, layout.avatarSize) * scale : contentSize;

    if (layout.direction === 'inline') {
        const canvasHeight = Math.ceil(Math.max(boxSize, labelHeight));
        return {
            canvasWidth: Math.ceil(boxSize + (hasLabel ? labelGap + labelWidth : 0)),
            canvasHeight,
            contentLeft: (boxSize - contentSize) / 2,
            contentTop: (canvasHeight - contentSize) / 2,
            labelLeft: boxSize + labelGap,
            labelTop: (canvasHeight - labelHeight) / 2,
        };
    }

    const canvasWidth = Math.ceil(Math.max(contentSize, labelWidth));
    const labelTop = (boxSize + layout.glyphSize * scale) / 2 + labelGap;
    return {
        canvasWidth,
        canvasHeight: Math.ceil(hasLabel ? labelTop + labelHeight : boxSize),
        contentLeft: (canvasWidth - contentSize) / 2,
        contentTop: (boxSize - contentSize) / 2,
        labelLeft: (canvasWidth - labelWidth) / 2,
        labelTop,
    };
}

function drawTabIcon(layout: TabIconLayout, {name, color, avatar, dotColor, emojiStatus, label}: TabIconParams): NativeBottomTabIcon | undefined {
    const scale = PixelRatio.get();
    const contentSize = (avatar ? layout.avatarSize : layout.glyphSize) * scale;
    const paragraph = label ? makeLabelParagraph(label, scale) : undefined;
    const {canvasWidth, canvasHeight, contentLeft, contentTop, labelLeft, labelTop} = getTabIconFrame(
        layout,
        contentSize,
        (label?.gap ?? 0) * scale,
        paragraph?.getLongestLine() ?? 0,
        paragraph?.getHeight() ?? 0,
        !!label,
        scale,
    );

    const surface = Skia.Surface.Make(canvasWidth, canvasHeight);
    if (!surface) {
        paragraph?.dispose();
        return undefined;
    }

    const canvas = surface.getCanvas();
    if (avatar) {
        drawCircularImage(canvas, avatar.image, contentLeft, contentTop, contentSize);
    } else {
        drawGlyph(canvas, name, contentLeft, contentTop, contentSize, color);
    }
    if (dotColor) {
        drawStatusDot(canvas, contentLeft + contentSize, contentTop, scale, dotColor);
    }
    if (emojiStatus) {
        drawEmojiStatus(canvas, contentLeft + contentSize, contentTop + contentSize, scale, emojiStatus);
    }
    if (paragraph) {
        paragraph.paint(canvas, labelLeft, labelTop);
        paragraph.dispose();
    }

    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);
    snapshot.dispose();
    surface.dispose();

    return {
        type: 'image',
        source: {uri: `data:image/png;base64,${base64}`, width: canvasWidth / scale, height: canvasHeight / scale, scale},
        tinted: false,
    };
}

/**
 * Draws a tab icon synchronously, so the bar never waits for it, and reuses it for as long as everything drawn into it
 * stays the same. A status, theme or language change redraws only the icons it reaches.
 */
function getTabIcon(layout: TabIconLayout, params: TabIconParams): NativeBottomTabIcon | undefined {
    const {name, color, avatar, dotColor, emojiStatus, label} = params;
    // The label's font is fixed per platform, so it is left out of the key.
    const key = [layout.direction, name, avatar?.uri ?? color, dotColor, emojiStatus?.emoji, emojiStatus?.backgroundColor, label?.text, label?.color, label?.isBold, label?.maxWidth].join(
        '|',
    );
    if (iconCache.has(key)) {
        return iconCache.get(key);
    }
    if (iconCache.size >= MAX_CACHED_ICONS) {
        iconCache.clear();
    }
    const icon = drawTabIcon(layout, params);
    iconCache.set(key, icon);
    return icon;
}

/** Both selection states as images, given as a function, because React Navigation derives the selected icon only from a function. */
function getTabBarIcon(layout: TabIconLayout, getParams: (isSelected: boolean) => TabIconParams): NativeBottomTabNavigationOptions['tabBarIcon'] {
    const inactiveIcon = getTabIcon(layout, getParams(false));
    const activeIcon = getTabIcon(layout, getParams(true));
    return inactiveIcon && activeIcon ? ({focused}) => (focused ? activeIcon : inactiveIcon) : undefined;
}

export default getTabBarIcon;
export type {TabIconLayout};
