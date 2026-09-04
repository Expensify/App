import type {VictoryChartContextValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {LabelItem, LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {SkFont, SkTypeface} from '@shopify/react-native-skia';

import {Skia} from '@shopify/react-native-skia';

import scalePixels from './scalePixels';

/**
 * Scales every pixel-space value of a parsed chart context by a uniform factor, so the chart can be
 * re-rendered natively at a larger target size (sharp Skia output) instead of raster-upscaling the
 * design-size render. Data-space values (data points, domains, tick values) are left untouched —
 * the chart's axes map them into the larger canvas automatically.
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
 * Rebuilds a Skia font at the scaled size using the chart's shared typeface; the original font
 * object is left untouched. The typeface must be passed in rather than read via `font.getTypeface()`
 * because CanvasKit (web) returns a raw pointer there that cannot be passed back into `Skia.Font`.
 */
function scaleFont(font: SkFont | null | undefined, scale: number, typeface: SkTypeface | null): SkFont | null | undefined {
    if (!font || !typeface) {
        return font;
    }
    return Skia.Font(typeface, font.getSize() * scale);
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

    return {
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
}

export default scaleVictoryChartContextValue;
export {scaleLabelItem};
