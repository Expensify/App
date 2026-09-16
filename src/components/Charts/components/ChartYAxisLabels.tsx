import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {ChartBounds, Scale} from 'victory-native';

import {Paragraph} from '@shopify/react-native-skia';
import React from 'react';

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
    fontManager: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Formats a tick value to its display string. */
    formatValue: (value: number) => string;

    /** When true, labels are left-aligned starting at the left edge of the chart instead of right-aligned. */
    leftAlign?: boolean;
};

function ChartYAxisLabels({yTicks, yScale, chartBounds, fontSize, fontManager, labelColor, formatValue, leftAlign = false}: ChartYAxisLabelsProps) {
    const formattedLabels = yTicks.map((tick) => formatValue(tick));

    const paragraphs = useChartParagraphs(formattedLabels, fontManager, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const maxWidth = Math.max(0, ...paragraphs.map((item) => item.width));

    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const lineHeight = ascent + descent;

    return yTicks.map((tick, i) => {
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }

        const x = chartBounds.left - VictoryTheme.axis.labelGap + GLYPH_PADDING - (leftAlign ? maxWidth : paraData.width);
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
