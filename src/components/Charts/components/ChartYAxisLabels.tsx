import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {AXIS_LABEL_GAP, GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/constants';
import type {ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph, getFontLineMetrics} from '@components/Charts/utils';

type ChartYAxisLabelsProps = {
    /** Tick values on the Y axis. */
    yTicks: number[];

    /** Maps a tick value to its y-pixel position. */
    yScale: Scale;

    /** Chart plot area bounds. */
    chartBounds: ChartBounds;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontMgr: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Formats a tick value to its display string. */
    formatValue: (value: number) => string;

    /** When true, labels are left-aligned starting at chartBounds.left + AXIS_LABEL_GAP instead of right-aligned. */
    leftAlign?: boolean;
};

function ChartYAxisLabels({yTicks, yScale, chartBounds, fontSize, fontMgr, labelColor, formatValue, leftAlign = false}: ChartYAxisLabelsProps) {
    const formattedLabels = yTicks.map((tick) => formatValue(tick));

    const paragraphs: ParagraphWithWidth[] = formattedLabels.map((label) => {
        const para = buildChartParagraph(label, fontMgr, fontSize, labelColor);
        para.layout(MAX_Y_AXIS_LABEL_WIDTH);
        const width = para.getLongestLine();
        return {para, width};
    });
    const maxWidth = Math.max(0, ...paragraphs.map((item) => item.width));

    // Derive line height from the first available paragraph's line metrics.
    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
    const lineHeight = ascent + descent;

    return yTicks.map((tick, i) => {
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }

        const x = chartBounds.left - AXIS_LABEL_GAP + GLYPH_PADDING / 2 - (leftAlign ? maxWidth : paraData.width);
        const tickY = yScale(tick);

        return (
            <Paragraph
                key={`y-label-${tick}`}
                paragraph={paraData.para}
                x={x}
                y={tickY - lineHeight / 2}
                width={paraData.width + GLYPH_PADDING * 2}
            />
        );
    });
}

/**
 * Custom comparator for React.memo.
 *
 * Victory-native's `renderOutside` callback is invoked on every pointer/hover event and always
 * passes freshly-created objects for `yScale` and `chartBounds`, even when the underlying chart
 * geometry has not changed. Without this comparator, `ChartYAxisLabels` would re-render on every
 * mouse move, triggering expensive Skia paragraph re-builds for every label.
 *
 * Instead of relying on reference equality, we compare the values that actually affect rendering:
 * tick values, bounds coordinates, font settings, and a sampled scale output.
 */
function arePropsEqual(prev: ChartYAxisLabelsProps, next: ChartYAxisLabelsProps): boolean {
    return (
        prev.yTicks.length === next.yTicks.length &&
        prev.yTicks.every((t, i) => t === next.yTicks.at(i)) &&
        prev.chartBounds.left === next.chartBounds.left &&
        prev.chartBounds.right === next.chartBounds.right &&
        prev.chartBounds.top === next.chartBounds.top &&
        prev.chartBounds.bottom === next.chartBounds.bottom &&
        prev.fontSize === next.fontSize &&
        prev.fontMgr === next.fontMgr &&
        prev.labelColor === next.labelColor &&
        prev.formatValue === next.formatValue &&
        prev.leftAlign === next.leftAlign &&
        (prev.yTicks.length === 0 || prev.yScale(prev.yTicks.at(0) ?? 0) === next.yScale(prev.yTicks.at(0) ?? 0))
    );
}

export default React.memo(ChartYAxisLabels, arePropsEqual);
export type {ChartYAxisLabelsProps};
