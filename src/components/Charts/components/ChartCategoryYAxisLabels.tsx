import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {Scale} from 'victory-native';
import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics, truncateLabel} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

type ChartCategoryYAxisLabelsProps = {
    /** Category label strings, one per bar row. */
    labels: string[];

    /** Pre-measured pixel width of each original label. */
    labelWidths: number[];

    /** Pixel width of the ellipsis character. */
    ellipsisWidth: number;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontMgr: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Maps a category index to its y-pixel position on the chart. */
    yScale: Scale;

    /** X-pixel coordinate of the right edge where labels should end. */
    labelRightX: number;
};

function ChartCategoryYAxisLabels({labels, labelWidths, ellipsisWidth, fontSize, fontMgr, labelColor, yScale, labelRightX}: ChartCategoryYAxisLabelsProps) {
    const truncatedLabels = labels.map((label, index) => truncateLabel(label, labelWidths.at(index) ?? 0, MAX_Y_AXIS_LABEL_WIDTH, ellipsisWidth));
    const paragraphs = useChartParagraphs(truncatedLabels, fontMgr, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
    const lineHeight = ascent + descent;

    return truncatedLabels.map((label, index) => {
        const paraData = paragraphs?.at(index);
        if (!paraData) {
            return null;
        }

        const tickY = yScale(index);
        const x = labelRightX - VictoryTheme.axis.labelGap - paraData.width;

        return (
            <Paragraph
                key={`category-label-${label}-${index}`}
                paragraph={paraData.para}
                x={x}
                y={tickY - lineHeight / 2}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

export default ChartCategoryYAxisLabels;
