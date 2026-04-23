import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {AXIS_LABEL_GAP, GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/constants';
import useChartParagraphs from '@components/Charts/hooks/useChartParagraphs';
import {getFontLineMetrics} from '@components/Charts/utils';

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

    const paragraphs = useChartParagraphs(formattedLabels, fontMgr, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const maxWidth = Math.max(0, ...paragraphs.map((item) => item.width));

    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
    const lineHeight = ascent + descent;

    return yTicks.map((tick, i) => {
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }

        const x = chartBounds.left - AXIS_LABEL_GAP + GLYPH_PADDING - (leftAlign ? maxWidth : paraData.width);
        const tickY = yScale(tick);

        return (
            <Paragraph
                key={`y-label-${tick}`}
                paragraph={paraData.para}
                x={x}
                y={tickY - lineHeight / 2}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

export default ChartYAxisLabels;
export type {ChartYAxisLabelsProps};
