import type {VictoryChartContextValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {LabelItem, LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {SkFont, SkTypeface} from '@shopify/react-native-skia';

import createVictoryChartFont from './createVictoryChartFont';
import scalePixels from './scalePixels';

/**
 * Scales every pixel-space value of a parsed chart context by a uniform factor so the chart can be
 * rendered natively at another size. Data-space values (points, domains, ticks) are untouched.
 */

function scaleRecordValues(record: Record<number, number> | undefined, scale: number): Record<number, number> | undefined {
    if (!record) {
        return record;
    }
    return Object.fromEntries(Object.entries(record).map(([key, fontValue]) => [key, fontValue * scale]));
}

function scaleLabelItem(labelItem: LabelItem, scale: number): LabelItem {
    return {
        ...labelItem,
        x: labelItem.x * scale,
        y: labelItem.y * scale,
        // lineHeight is a multiplier of the font size, so it needs no scaling.
        fontSize: scaleRecordValues(labelItem.fontSize, scale),
    };
}

function scaleLegendItem(legendItem: LegendItem, scale: number): LegendItem {
    return {
        ...legendItem,
        x: legendItem.x * scale,
        y: legendItem.y * scale,
        gutter: scalePixels(legendItem.gutter, scale),
        symbolSpacer: scalePixels(legendItem.symbolSpacer, scale),
        entries: legendItem.entries.map((entry) => ({
            ...entry,
            fontSize: scalePixels(entry.fontSize, scale),
            symbolSize: scalePixels(entry.symbolSize, scale),
        })),
    };
}

type SidedPixelValues = {left?: number; right?: number; top?: number; bottom?: number};

function scaleSidedPixelValues(sides: SidedPixelValues, scale: number): SidedPixelValues {
    return {
        left: scalePixels(sides.left, scale),
        right: scalePixels(sides.right, scale),
        top: scalePixels(sides.top, scale),
        bottom: scalePixels(sides.bottom, scale),
    };
}

/** (Domain) padding can be a plain number or a per-side object — scale every numeric part. */
function scalePadding(padding: number | SidedPixelValues | undefined, scale: number): number | SidedPixelValues | undefined {
    if (padding === undefined) {
        return undefined;
    }
    if (typeof padding === 'number') {
        return padding * scale;
    }
    return scaleSidedPixelValues(padding, scale);
}

/**
 * Rebuilds a Skia font at the scaled size. The typeface is passed in because on web `font.getTypeface()`
 * returns a raw pointer that CanvasKit refuses to reuse.
 */
function scaleFont(font: SkFont | null | undefined, scale: number, typeface: SkTypeface | null): SkFont | null | undefined {
    if (!font || !typeface) {
        return font;
    }
    return createVictoryChartFont(typeface, font.getSize() * scale);
}

function scaleAxis<TAxis extends {lineWidth?: number; labelOffset?: number; font?: SkFont | null} | undefined>(axis: TAxis, scale: number, typeface: SkTypeface | null): TAxis {
    if (!axis) {
        return axis;
    }
    return {
        ...axis,
        lineWidth: scalePixels(axis.lineWidth, scale),
        labelOffset: scalePixels(axis.labelOffset, scale),
        font: scaleFont(axis.font, scale, typeface),
    };
}

function scaleVictoryChartContextValue(value: VictoryChartContextValue, scale: number, typeface: SkTypeface | null = null): VictoryChartContextValue {
    if (scale === 1) {
        return value;
    }

    const designWidth = typeof value.chartContentStyles.width === 'number' ? value.chartContentStyles.width * scale : value.chartContentStyles.width;
    const designHeight = typeof value.chartContentStyles.height === 'number' ? value.chartContentStyles.height * scale : value.chartContentStyles.height;

    const scaledValue: VictoryChartContextValue = {
        ...value,
        xAxis: scaleAxis(value.xAxis, scale, typeface),
        yAxis: value.yAxis?.map((axis) => scaleAxis(axis, scale, typeface)),
        domainPadding: scalePadding(value.domainPadding, scale),
        padding: scalePadding(value.padding, scale),
        labelItems: value.labelItems.map((labelItem) => scaleLabelItem(labelItem, scale)),
        legendItems: value.legendItems.map((legendItem) => scaleLegendItem(legendItem, scale)),
        chartContentStyles: {...value.chartContentStyles, width: designWidth, height: designHeight},
        pixelScale: value.pixelScale * scale,
    };
    releaseScaledFontsWithContext(scaledValue, value);

    return scaledValue;
}

/**
 * Disposes the fonts a scaled context created once that context can no longer be reached.
 *
 * An effect cleanup is the wrong owner for them. React also runs cleanups when an Activity hides a screen, and
 * reconnects the same context value when the screen is shown again, so the chart would be left drawing with
 * disposed fonts. A context value that is never committed would not be cleaned up at all.
 *
 * Where the JS runtime has no FinalizationRegistry, the fonts are not disposed explicitly and are freed when
 * their Skia host objects are garbage collected instead.
 */
const scaledFontsRegistry =
    typeof FinalizationRegistry === 'undefined'
        ? undefined
        : new FinalizationRegistry<SkFont[]>((fonts) => {
              for (const font of fonts) {
                  font.dispose();
              }
          });

/** Hands the axis fonts created for a scaled context to the registry, leaving the original (shared) fonts untouched. */
function releaseScaledFontsWithContext(scaled: VictoryChartContextValue, original: VictoryChartContextValue) {
    const originalFonts = new Set([original.xAxis?.font, ...(original.yAxis ?? []).map((axis) => axis.font)]);
    const createdFonts = [scaled.xAxis?.font, ...(scaled.yAxis ?? []).map((axis) => axis.font)].filter((font): font is SkFont => !!font && !originalFonts.has(font));
    if (createdFonts.length > 0) {
        scaledFontsRegistry?.register(scaled, createdFonts);
    }
}

export default scaleVictoryChartContextValue;
export {scaleLabelItem};
