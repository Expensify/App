import type {VictoryChartContextValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {LabelItem, LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {SkFont} from '@shopify/react-native-skia';

import {Skia} from '@shopify/react-native-skia';

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
        gutter: legendItem.gutter === undefined ? undefined : legendItem.gutter * scale,
        symbolSpacer: legendItem.symbolSpacer === undefined ? undefined : legendItem.symbolSpacer * scale,
        entries: legendItem.entries.map((entry) => ({
            ...entry,
            fontSize: entry.fontSize === undefined ? undefined : entry.fontSize * scale,
            symbolSize: entry.symbolSize === undefined ? undefined : entry.symbolSize * scale,
        })),
    };
}

/** Padding/domainPadding can be a plain number or a per-side object — scale every numeric part. */
function scalePaddingLike<T>(padding: T, scale: number): T {
    if (typeof padding === 'number') {
        return (padding * scale) as T;
    }
    if (padding && typeof padding === 'object') {
        return Object.fromEntries(Object.entries(padding).map(([side, sideValue]) => [side, typeof sideValue === 'number' ? sideValue * scale : sideValue])) as T;
    }
    return padding;
}

/** Rebuilds a Skia font at the scaled size; the original font object is left untouched. */
function scaleFont(font: SkFont | null | undefined, scale: number): SkFont | null | undefined {
    if (!font) {
        return font;
    }
    const typeface = font.getTypeface();
    if (!typeface) {
        return font;
    }
    return Skia.Font(typeface, font.getSize() * scale);
}

function scaleAxis<TAxis extends {lineWidth?: number; labelOffset?: number; font?: SkFont | null} | undefined>(axis: TAxis, scale: number): TAxis {
    if (!axis) {
        return axis;
    }
    return {
        ...axis,
        lineWidth: axis.lineWidth === undefined ? undefined : axis.lineWidth * scale,
        labelOffset: axis.labelOffset === undefined ? undefined : axis.labelOffset * scale,
        font: scaleFont(axis.font, scale),
    };
}

function scaleVictoryChartContextValue(value: VictoryChartContextValue, scale: number): VictoryChartContextValue {
    if (scale === 1) {
        return value;
    }

    const designWidth = typeof value.chartContentStyles.width === 'number' ? value.chartContentStyles.width * scale : value.chartContentStyles.width;
    const designHeight = typeof value.chartContentStyles.height === 'number' ? value.chartContentStyles.height * scale : value.chartContentStyles.height;

    return {
        ...value,
        xAxis: scaleAxis(value.xAxis, scale),
        yAxis: value.yAxis?.map((axis) => scaleAxis(axis, scale)),
        domainPadding: scalePaddingLike(value.domainPadding, scale),
        padding: scalePaddingLike(value.padding, scale),
        labelItems: value.labelItems.map((labelItem) => scaleLabelItem(labelItem, scale)),
        legendItems: value.legendItems.map((legendItem) => scaleLegendItem(legendItem, scale)),
        chartContentStyles: {...value.chartContentStyles, width: designWidth, height: designHeight},
    };
}

export default scaleVictoryChartContextValue;
