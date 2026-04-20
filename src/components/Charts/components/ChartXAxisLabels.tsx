import {Group, Paragraph, vec} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import {AXIS_LABEL_GAP, GLYPH_PADDING, MAX_X_AXIS_LABEL_WIDTH} from '@components/Charts/constants';
import type {LabelRotation, ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph, getFontLineMetrics, rotatedLabelCenterCorrection, rotatedLabelYOffset} from '@components/Charts/utils';
import variables from '@styles/variables';

type ChartXAxisLabelsProps = {
    /** Processed label strings (already truncated by the layout hook). */
    labels: string[];

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

function ChartXAxisLabels({labels, labelRotation, labelSkipInterval, fontSize, fontMgr, labelColor, xScale, chartBoundsBottom, centerRotatedLabels = false}: ChartXAxisLabelsProps) {
    const angleRad = (Math.abs(labelRotation) * Math.PI) / 180;

    const paragraphs: ParagraphWithWidth[] = labels.map((label) => {
        if (label.length === 0) {
            return {para: null, width: 0};
        }
        const para = buildChartParagraph(label, fontMgr, fontSize, labelColor);
        para.layout(MAX_X_AXIS_LABEL_WIDTH);
        return {para, width: para.getLongestLine()};
    });

    const labelWidths = labels.map((_, i) => paragraphs?.at(i)?.width ?? 0);

    // Derive ascent/descent from the first available paragraph's line metrics.
    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);

    const correction = rotatedLabelCenterCorrection(ascent, descent, angleRad);
    const centeredUpwardOffset = centerRotatedLabels && angleRad > 0 ? (Math.max(...labelWidths) / 2) * Math.sin(angleRad) : 0;
    const labelY = chartBoundsBottom + AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) + centeredUpwardOffset;

    return labels.map((label, i) => {
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

/**
 * Custom comparator for React.memo.
 *
 * Victory-native's `renderOutside` callback is invoked on every pointer/hover event and always
 * passes freshly-created objects for `xScale` and `chartBounds`, even when the underlying chart
 * geometry has not changed. Without this comparator, `ChartXAxisLabels` would re-render on every
 * mouse move, triggering expensive Skia paragraph re-builds for every label.
 *
 * Instead of relying on reference equality, we compare the values that actually affect rendering:
 * label strings, rotation, font settings, and a sampled scale output.
 */
function arePropsEqual(prev: ChartXAxisLabelsProps, next: ChartXAxisLabelsProps): boolean {
    return (
        prev.labels.length === next.labels.length &&
        prev.labels.every((l, i) => l === next.labels.at(i)) &&
        prev.labelRotation === next.labelRotation &&
        prev.labelSkipInterval === next.labelSkipInterval &&
        prev.fontSize === next.fontSize &&
        prev.fontMgr === next.fontMgr &&
        prev.labelColor === next.labelColor &&
        prev.chartBoundsBottom === next.chartBoundsBottom &&
        prev.centerRotatedLabels === next.centerRotatedLabels &&
        prev.xScale(0) === next.xScale(0)
    );
}

export default React.memo(ChartXAxisLabels, arePropsEqual);
export type {ChartXAxisLabelsProps};
