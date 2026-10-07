import FontUtils from '@styles/utils/FontUtils';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas, SkImage, SkParagraph, SkPath} from '@shopify/react-native-skia';

import {BlendMode, ClipOp, FillType, FilterMode, FontWeight, ImageFormat, MipmapMode, Skia, TextAlign} from '@shopify/react-native-skia';
import {PixelRatio} from 'react-native';

import type {NativeTabGlyph, NativeTabName} from './NATIVE_TAB_GLYPHS';

import NATIVE_TAB_GLYPHS from './NATIVE_TAB_GLYPHS';

type TabIconLayout = {
    /** Side of a glyph's box. */
    glyphSize: number;
    /** Side of the account avatar's box. */
    avatarSize: number;
    /** Radius of the status dot drawn at the content's top right corner. */
    dotRadius: number;
    /** Width of the transparent ring cut out of the content around the status dot. */
    dotCutout: number;
    /** Gap between the glyph box and the label drawn under it. */
    labelGap: number;
    /** Font size of the label drawn under the glyph. */
    labelFontSize: number;
};

type TabIconLabel = {
    text: string;
    color: string;
    isBold: boolean;
    /** Width of the tab's slot in the bar, past which the label is truncated with an ellipsis. */
    maxWidth: number;
};

type TabIconParams = {
    /** The glyph drawn unless an avatar is given. */
    name: NativeTabName;
    color: string;
    avatar?: {uri: string; image: SkImage};
    dotColor?: string;
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
function makeLabelParagraph({text, color, isBold, maxWidth}: TabIconLabel, fontSize: number, scale: number): SkParagraph {
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

function drawStatusDot(canvas: SkCanvas, right: number, top: number, radius: number, cutout: number, color: string) {
    const centerX = right - radius;
    const centerY = top + radius;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    if (cutout > 0) {
        paint.setBlendMode(BlendMode.Clear);
        canvas.drawCircle(centerX, centerY, radius + cutout, paint);
        paint.setBlendMode(BlendMode.SrcOver);
    }
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(centerX, centerY, radius, paint);
    paint.dispose();
}

function drawTabIcon(layout: TabIconLayout, {name, color, avatar, dotColor, label}: TabIconParams): NativeBottomTabIcon | undefined {
    const scale = PixelRatio.get();
    const contentSize = (avatar ? layout.avatarSize : layout.glyphSize) * scale;
    // With a label, every tab shares one row as tall as the avatar, so glyphs and the avatar share a centre and
    // every label lands at the same height.
    const rowSize = label ? Math.max(layout.glyphSize, layout.avatarSize) * scale : contentSize;
    const labelTop = (rowSize + layout.glyphSize * scale) / 2 + layout.labelGap * scale;
    const paragraph = label ? makeLabelParagraph(label, layout.labelFontSize, scale) : undefined;
    const labelWidth = paragraph?.getLongestLine() ?? 0;
    const labelHeight = paragraph?.getHeight() ?? 0;
    const canvasWidth = Math.ceil(Math.max(contentSize, labelWidth));
    const canvasHeight = Math.ceil(label ? labelTop + labelHeight : rowSize);

    const surface = Skia.Surface.Make(canvasWidth, canvasHeight);
    if (!surface) {
        paragraph?.dispose();
        return undefined;
    }

    const canvas = surface.getCanvas();
    const contentLeft = (canvasWidth - contentSize) / 2;
    const contentTop = (rowSize - contentSize) / 2;
    if (avatar) {
        drawCircularImage(canvas, avatar.image, contentLeft, contentTop, contentSize);
    } else {
        drawGlyph(canvas, name, contentLeft, contentTop, contentSize, color);
    }
    if (dotColor) {
        drawStatusDot(canvas, contentLeft + contentSize, contentTop, layout.dotRadius * scale, layout.dotCutout * scale, dotColor);
    }
    if (paragraph) {
        paragraph.paint(canvas, (canvasWidth - labelWidth) / 2, labelTop);
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
    const {name, color, avatar, dotColor, label} = params;
    const key = [
        name,
        avatar?.uri ?? color,
        dotColor,
        label?.text,
        label?.color,
        label?.isBold,
        label?.maxWidth,
        layout.glyphSize,
        layout.avatarSize,
        layout.dotRadius,
        layout.dotCutout,
    ].join('|');
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

export default getTabIcon;
export type {TabIconLayout};
