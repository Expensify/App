import {Group, Paragraph, vec} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import {AXIS_LABEL_GAP, GLYPH_PADDING, MAX_X_AXIS_LABEL_WIDTH} from '@components/Charts/constants';
import useChartParagraphs from '@components/Charts/hooks/useChartParagraphs';
import type {LabelRotation} from '@components/Charts/types';
import {getFontLineMetrics, rotatedLabelCenterCorrection, rotatedLabelYOffset, truncateLabel} from '@components/Charts/utils';
import variables from '@styles/variables';

type ChartXAxisLabelsProps = {
    /** Original (non-truncated) label strings from the data. */
    labels: string[];

    /** Pre-measured pixel width of each original label (from useChartLabelMeasurements). */
    labelWidths: number[];

    /** Maximum pixel width for inner tick labels (not first/last). From useChartLabelLayout (`tickMaxWidth`). */
    regularLabelMaxWidth: number;

    /** Maximum pixel width for the first label (edge + tick constraints). */
    firstLabelMaxWidth: number;

    /** Maximum pixel width for the last label (edge + tick constraints). */
    lastLabelMaxWidth: number;

    /** Pixel width of the ellipsis character (from useChartLabelMeasurements). */
    ellipsisWidth: number;

    /** Label rotation in degrees (e.g. 0, 45, 90). */
    labelRotation: LabelRotation;

    /** Show every Nth label (1 = all, 2 = every other, etc.). */
    labelSkipInterval: number;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontMgr: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Maps a data-point index to its x-pixel position on the chart. */
    xScale: (value: number) => number;

    /** Y-pixel coordinate of the bottom edge of the chart plot area. */
    chartBoundsBottom: number;

    /** When true, rotated labels are centered on the tick. When false, they are right-aligned (end of text at tick). */
    centerRotatedLabels?: boolean;
};

function ChartXAxisLabels({
    labels,
    labelWidths,
    regularLabelMaxWidth,
    firstLabelMaxWidth,
    lastLabelMaxWidth,
    ellipsisWidth,
    labelRotation,
    labelSkipInterval,
    fontSize,
    fontMgr,
    labelColor,
    xScale,
    chartBoundsBottom,
    centerRotatedLabels = false,
}: ChartXAxisLabelsProps) {
    const angleRad = (Math.abs(labelRotation) * Math.PI) / 180;
    const truncatedLabels = (() => {
        const lastIndex = labels.length - 1;
        return labels.map((label, i) => {
            let maxWidth = regularLabelMaxWidth;
            if (i === 0) {
                maxWidth = firstLabelMaxWidth;
            } else if (i === lastIndex) {
                maxWidth = lastLabelMaxWidth;
            }
            return truncateLabel(label, labelWidths.at(i) ?? 0, maxWidth, ellipsisWidth);
        });
    })();

    const paragraphs = useChartParagraphs(truncatedLabels, fontMgr, fontSize, labelColor, MAX_X_AXIS_LABEL_WIDTH);

    const renderedWidths = truncatedLabels.map((_, i) => paragraphs?.at(i)?.width ?? 0);

    // Derive ascent/descent from the first available paragraph's line metrics.
    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);

    const correction = rotatedLabelCenterCorrection(ascent, descent, angleRad);
    const centeredUpwardOffset = centerRotatedLabels && angleRad > 0 ? (Math.max(...renderedWidths) / 2) * Math.sin(angleRad) : 0;
    const labelY = chartBoundsBottom + AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) + centeredUpwardOffset;

    return truncatedLabels.map((label, i) => {
        if (i % labelSkipInterval !== 0 || label.length === 0) {
            return null;
        }

        const tickX = xScale(i);
        const paraData = paragraphs?.at(i) ?? null;
        if (!paraData) {
            return null;
        }

        const renderWidth = paraData.width;

        if (angleRad === 0) {
            return (
                <Paragraph
                    key={`x-label-${label}-${tickX}`}
                    paragraph={paraData.para}
                    x={tickX - renderWidth / 2}
                    y={labelY - variables.iconSizeExtraSmall}
                    width={renderWidth + GLYPH_PADDING}
                />
            );
        }

        const textX = centerRotatedLabels ? tickX - renderWidth / 2 : tickX - renderWidth;
        const origin = vec(tickX, labelY);

        return (
            <Group
                key={`x-label-${label}-${tickX}`}
                origin={origin}
                transform={[{translateX: correction}, {rotate: -angleRad}]}
            >
                <Paragraph
                    paragraph={paraData.para}
                    x={textX}
                    y={labelY - ascent}
                    width={renderWidth + GLYPH_PADDING}
                />
            </Group>
        );
    });
}

export default ChartXAxisLabels;
export type {ChartXAxisLabelsProps};
