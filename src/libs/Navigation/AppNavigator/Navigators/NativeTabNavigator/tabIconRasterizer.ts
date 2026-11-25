import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import type {NativeBottomTabIcon, NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';
import type {SkCanvas, SkParagraph, SkPath} from 'react-native-skia';

import {PixelRatio} from 'react-native';
import {BlendMode, FillType, FontWeight, ImageFormat, PaintStyle, Skia, StrokeJoin, TextAlign} from 'react-native-skia';

import type {NativeTabGlyph, NativeTabGlyphName} from './NATIVE_TAB_GLYPHS';

import NATIVE_TAB_GLYPHS from './NATIVE_TAB_GLYPHS';

type TabIconLayout = {
    /** Side of a glyph's box. */
    glyphSize: number;
    /** Side of the box that aligns a glyph with its label. */
    iconBoxSize: number;
    /** Whether the label is drawn under the glyph or beside it, as UIKit lays out a tab in landscape. */
    direction: 'stacked' | 'inline';
    /** Transparent space after the label of an inline icon. */
    trailingInset?: number;
    /**
     * Where an accessory glyph goes: beside the glyph, which widens the icon, over the glyph's bottom right corner, for a
     * bar that squeezes a wider icon into a square slot, or at the right edge of the selected pill, for a bar whose pill
     * is wider than the glyph. Defaults to beside.
     */
    accessoryPlacement?: 'beside' | 'corner' | 'pillEdge';
    /** Width of the selected pill, which an icon with its accessory at the pill's edge spans. */
    pillWidth?: number;
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

type TabIconAccessory = {
    name: NativeTabGlyphName;
    color: string;
};

type TabIconParams = {
    name: NativeTabGlyphName;
    color: string;
    dotColor?: string;
    label?: TabIconLabel;
    /** A smaller glyph drawn with the main one, where the layout's `accessoryPlacement` says. The main glyph stays centered over its label. */
    accessory?: TabIconAccessory;
    /** Frames the icon as if it had an accessory, so an item that shows one only some of the time keeps its width in the bar. */
    reservesAccessory?: boolean;
};

/** Side of an accessory glyph's box, relative to the main glyph. */
const ACCESSORY_GLYPH_SCALE = 0.5;

/**
 * Upper bound on cached icons, enough for every tab and every glyph of the More item in both selection states, in both
 * orientations, across a few status and theme changes. Reaching it clears the cache, so every icon is drawn again.
 */
const MAX_CACHED_ICONS = 128;

const iconCache = new Map<string, NativeBottomTabIcon | undefined>();
const glyphPathCache = new Map<NativeTabGlyphName, SkPath[]>();

function getGlyphPaths(name: NativeTabGlyphName): SkPath[] {
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
        // Paths are immutable since react-native-skia 2.15, so the fill type is set on a copy made through a builder.
        paths.push(isEvenOdd ? Skia.PathBuilder.MakeFromPath(path).setFillType(FillType.EvenOdd).detach() : path);
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

/**
 * @param cutout - width of the ring cleared around the glyph's outline, in canvas pixels, so a glyph drawn over another
 * stays readable, as the status dot's cutout does
 */
function drawGlyph(canvas: SkCanvas, name: NativeTabGlyphName, left: number, top: number, size: number, color: string, cutout = 0) {
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    const viewBoxScale = size / NATIVE_TAB_GLYPHS[name].viewBoxSize;
    const paths = getGlyphPaths(name);

    canvas.save();
    canvas.translate(left, top);
    canvas.scale(viewBoxScale, viewBoxScale);
    if (cutout) {
        paint.setBlendMode(BlendMode.Clear);
        paint.setStyle(PaintStyle.Stroke);
        paint.setStrokeJoin(StrokeJoin.Round);
        // The stroke is centered on the outline and drawn in viewBox units, so it is twice the cutout, scaled back.
        paint.setStrokeWidth((2 * cutout) / viewBoxScale);
        for (const path of paths) {
            canvas.drawPath(path, paint);
        }
        paint.setBlendMode(BlendMode.SrcOver);
        paint.setStyle(PaintStyle.Fill);
    }
    paint.setColor(Skia.Color(color));
    for (const path of paths) {
        canvas.drawPath(path, paint);
    }
    canvas.restore();
    paint.dispose();
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

type TabIconFrame = {
    canvasWidth: number;
    canvasHeight: number;
    contentLeft: number;
    contentTop: number;
    labelLeft: number;
    labelTop: number;
};

/**
 * With a label, every tab gives its glyph the same box, so every label starts at the same place:
 * under that box, or beside it in landscape.
 */
function getTabIconFrame(
    layout: TabIconLayout,
    contentSize: number,
    accessoryWidth: number,
    labelGap: number,
    labelWidth: number,
    labelHeight: number,
    hasLabel: boolean,
    scale: number,
): TabIconFrame {
    const boxSize = hasLabel ? Math.max(layout.glyphSize, layout.iconBoxSize) * scale : contentSize;

    if (layout.direction === 'inline') {
        const canvasHeight = Math.ceil(Math.max(boxSize, labelHeight));
        // The label of every tab starts after the glyph's box, so the accessory pushes only its own label further.
        const labelLeft = boxSize + accessoryWidth + labelGap;
        return {
            canvasWidth: Math.ceil(hasLabel ? labelLeft + labelWidth + (layout.trailingInset ?? 0) * scale : boxSize + accessoryWidth),
            canvasHeight,
            contentLeft: (boxSize - contentSize) / 2,
            contentTop: (canvasHeight - contentSize) / 2,
            labelLeft,
            labelTop: (canvasHeight - labelHeight) / 2,
        };
    }

    // The canvas grows by the accessory on both sides, so the glyph stays centered over the label and in the bar item.
    const canvasWidth = Math.ceil(Math.max(contentSize + 2 * accessoryWidth, labelWidth));
    const labelTop = (boxSize + layout.glyphSize * scale) / 2 + labelGap;
    const contentTop = (boxSize - contentSize) / 2;
    return {
        canvasWidth,
        canvasHeight: Math.ceil(hasLabel ? Math.max(labelTop + labelHeight, contentTop + contentSize) : boxSize),
        contentLeft: (canvasWidth - contentSize) / 2,
        contentTop,
        labelLeft: (canvasWidth - labelWidth) / 2,
        labelTop,
    };
}

/** Width the accessory adds on each side of the glyph, so the glyph stays centered. */
function getAccessoryWidth(layout: TabIconLayout, contentSize: number, scale: number): number {
    switch (layout.accessoryPlacement ?? 'beside') {
        case 'beside':
            return variables.nativeTabIconAccessoryGap * scale + contentSize * ACCESSORY_GLYPH_SCALE;
        case 'pillEdge':
            return Math.max(0, ((layout.pillWidth ?? 0) * scale - contentSize) / 2);
        default:
            return 0;
    }
}

function drawAccessory(
    canvas: SkCanvas,
    accessory: TabIconAccessory,
    placement: NonNullable<TabIconLayout['accessoryPlacement']>,
    contentLeft: number,
    contentTop: number,
    contentSize: number,
    canvasWidth: number,
    scale: number,
) {
    if (placement === 'corner') {
        const accessorySize = contentSize * ACCESSORY_GLYPH_SCALE;
        drawGlyph(
            canvas,
            accessory.name,
            contentLeft + contentSize - accessorySize,
            contentTop + contentSize - accessorySize,
            accessorySize,
            accessory.color,
            variables.nativeTabIconDotCutout * scale,
        );
        return;
    }
    const accessorySize = placement === 'pillEdge' ? variables.nativeTabIconPillEdgeAccessorySize * scale : contentSize * ACCESSORY_GLYPH_SCALE;
    const accessoryLeft =
        placement === 'pillEdge'
            ? canvasWidth - variables.nativeTabIconPillEdgeAccessoryInset * scale - accessorySize
            : contentLeft + contentSize + variables.nativeTabIconAccessoryGap * scale;
    drawGlyph(canvas, accessory.name, accessoryLeft, contentTop + (contentSize - accessorySize) / 2, accessorySize, accessory.color);
}

function drawTabIcon(layout: TabIconLayout, {name, color, dotColor, label, accessory, reservesAccessory}: TabIconParams): NativeBottomTabIcon | undefined {
    const scale = PixelRatio.get();
    const contentSize = layout.glyphSize * scale;
    const accessoryPlacement = layout.accessoryPlacement ?? 'beside';
    const paragraph = label ? makeLabelParagraph(label, scale) : undefined;
    // The label is bold only when selected, so both states are framed for the larger weight and the glyph stays put.
    const otherWeightParagraph = label ? makeLabelParagraph({...label, isBold: !label.isBold}, scale) : undefined;
    const labelWidth = Math.max(paragraph?.getLongestLine() ?? 0, otherWeightParagraph?.getLongestLine() ?? 0);
    const labelHeight = Math.max(paragraph?.getHeight() ?? 0, otherWeightParagraph?.getHeight() ?? 0);
    otherWeightParagraph?.dispose();
    const {canvasWidth, canvasHeight, contentLeft, contentTop, labelLeft, labelTop} = getTabIconFrame(
        layout,
        contentSize,
        accessory || reservesAccessory ? getAccessoryWidth(layout, contentSize, scale) : 0,
        (label?.gap ?? 0) * scale,
        labelWidth,
        labelHeight,
        !!label,
        scale,
    );

    const surface = Skia.Surface.Make(canvasWidth, canvasHeight);
    if (!surface) {
        paragraph?.dispose();
        return undefined;
    }

    const canvas = surface.getCanvas();
    drawGlyph(canvas, name, contentLeft, contentTop, contentSize, color);
    if (accessory) {
        drawAccessory(canvas, accessory, accessoryPlacement, contentLeft, contentTop, contentSize, canvasWidth, scale);
    }
    if (dotColor) {
        drawStatusDot(canvas, contentLeft + contentSize, contentTop, scale, dotColor);
    }
    if (paragraph) {
        // Centers the label in its bold-sized box: horizontally under the icon, vertically beside it.
        const isStacked = layout.direction === 'stacked';
        const centeringOffsetX = isStacked ? (labelWidth - paragraph.getLongestLine()) / 2 : 0;
        const centeringOffsetY = isStacked ? 0 : (labelHeight - paragraph.getHeight()) / 2;
        paragraph.paint(canvas, labelLeft + centeringOffsetX, labelTop + centeringOffsetY);
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
    const {name, color, dotColor, label, accessory, reservesAccessory} = params;
    // The label's font is fixed per platform, so it is left out of the key.
    const key = [
        layout.direction,
        name,
        color,
        dotColor,
        label?.text,
        label?.color,
        label?.isBold,
        label?.maxWidth,
        accessory?.name,
        accessory?.color,
        reservesAccessory,
        layout.accessoryPlacement,
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

/** Both selection states as images, given as a function, because React Navigation derives the selected icon only from a function. */
function getTabBarIcon(layout: TabIconLayout, getParams: (isSelected: boolean) => TabIconParams): NativeBottomTabNavigationOptions['tabBarIcon'] {
    const inactiveIcon = getTabIcon(layout, getParams(false));
    const activeIcon = getTabIcon(layout, getParams(true));
    return inactiveIcon && activeIcon ? ({focused}) => (focused ? activeIcon : inactiveIcon) : undefined;
}

export default getTabBarIcon;
export {getAccessoryWidth, getTabIconFrame};
export type {TabIconLayout};
