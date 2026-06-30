import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

type ChartValueXAxisLabelsProps = {
    /** Numeric tick values on the X axis. */
    xTicks: number[];

    /** Maps a tick value to its x-pixel position. */
    xScale: Scale;

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
};

function ChartValueXAxisLabels({xTicks, xScale, chartBounds, fontSize, fontManager, labelColor, formatValue}: ChartValueXAxisLabelsProps) {
    const formattedLabels = xTicks.map((tick) => formatValue(tick));
    const paragraphs = useChartParagraphs(formattedLabels, fontManager, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const {ascent} = getFontLineMetrics(fontManager, fontSize);
    const labelY = chartBounds.bottom + VictoryTheme.axis.labelGap;

    return xTicks.map((tick, i) => {
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }

        const tickX = xScale(tick);

        return (
            <Paragraph
                key={`value-x-label-${tick}`}
                paragraph={paraData.para}
                x={tickX - paraData.width / 2}
                y={labelY - ascent}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

export default ChartValueXAxisLabels;
