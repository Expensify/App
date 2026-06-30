import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

type ChartCategoryYAxisLabelsProps = {
    /** Truncated category label strings, one per data point. */
    truncatedLabels: string[];

    /** Category indices rendered on the Y axis (typically 0 … n-1). */
    categoryIndices: number[];

    /** Maps a category index to its y-pixel position. */
    yScale: Scale;

    /** Chart plot area bounds. */
    chartBounds: ChartBounds;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontManager: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;
};

function ChartCategoryYAxisLabels({truncatedLabels, categoryIndices, yScale, chartBounds, fontSize, fontManager, labelColor}: ChartCategoryYAxisLabelsProps) {
    const paragraphs = useChartParagraphs(truncatedLabels, fontManager, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const lineHeight = ascent + descent;

    return categoryIndices.map((categoryIndex) => {
        const paraData = paragraphs.at(categoryIndex);
        const label = truncatedLabels.at(categoryIndex);
        if (!paraData || !label) {
            return null;
        }

        const x = chartBounds.left - VictoryTheme.axis.labelGap + GLYPH_PADDING - paraData.width;
        const tickY = yScale(categoryIndex);

        return (
            <Paragraph
                key={`category-y-label-${label}-${categoryIndex}`}
                paragraph={paraData.para}
                x={x}
                y={tickY - lineHeight / 2}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

export default ChartCategoryYAxisLabels;
