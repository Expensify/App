import {buildChartParagraph, getFontLineMetrics} from '@components/Charts/utils';
import VictoryTheme, {DASH_INTERVALS, GLYPH_PADDING, MAX_X_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {ChartBounds, Scale} from 'victory-native';

import {DashPathEffect, Line, Paragraph, RoundedRect, vec} from '@shopify/react-native-skia';
import React from 'react';

type ChartAverageLineProps = {
    value: number;

    /** Maps a value to its y-pixel position */
    yScale: Scale;

    /** Plot area bounds the line spans */
    chartBounds: ChartBounds;

    /** Height of the whole canvas, which the value pill is kept inside */
    canvasHeight: number;

    /** Formats the average shown in the value pill */
    formatValue: (value: number) => string;

    fontSize: number;
    fontManager: SkTypefaceFontProvider;
};

/** Draws a horizontal dashed line across the plot at the average, with a pill at its right end labeling the amount */
function ChartAverageLine({value, yScale, chartBounds, canvasHeight, formatValue, fontSize, fontManager}: ChartAverageLineProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {strokeWidth, opacity, pillPaddingHorizontal, pillPaddingVertical, pillLabelGap} = VictoryTheme.averageLine;

    const y = yScale(value);
    const paragraph = buildChartParagraph(translate('insightsPage.compare.averageValue', formatValue(value)), fontManager, fontSize, theme.textReversed);
    paragraph.layout(MAX_X_AXIS_LABEL_WIDTH);
    const textWidth = paragraph.getLongestLine();
    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const pillWidth = textWidth + pillPaddingHorizontal * 2;
    const pillHeight = ascent + descent + pillPaddingVertical * 2;
    // The y-axis labels start `labelGap` to the right of the plot, so the pill ends `pillLabelGap` before them
    const pillX = chartBounds.right + VictoryTheme.axis.labelGap - pillLabelGap - pillWidth;
    // Centered on the line, but kept inside the canvas so an average near the top or bottom of the plot isn't cut off
    const pillY = Math.min(Math.max(y - pillHeight / 2, 0), canvasHeight - pillHeight);

    return (
        <>
            <Line
                p1={vec(chartBounds.left, y)}
                p2={vec(pillX, y)}
                color={theme.text}
                opacity={opacity}
                strokeWidth={strokeWidth}
                strokeCap="round"
            >
                <DashPathEffect intervals={DASH_INTERVALS} />
            </Line>
            <RoundedRect
                x={pillX}
                y={pillY}
                width={pillWidth}
                height={pillHeight}
                r={variables.componentBorderRadiusSmall}
                color={theme.heading}
            />
            <Paragraph
                paragraph={paragraph}
                x={pillX + pillPaddingHorizontal}
                y={pillY + pillPaddingVertical}
                width={textWidth + GLYPH_PADDING}
            />
        </>
    );
}

export default ChartAverageLine;
