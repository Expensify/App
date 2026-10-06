import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics, measureTextWidth, truncateLabel} from '@components/Charts/utils';
import {ELLIPSIS, GLYPH_PADDING, LABEL_PADDING, MAX_X_AXIS_LABEL_WIDTH, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

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

    /** When true, thin out labels so vertically stacked rows never overlap (used by the horizontal chart's category axis). */
    avoidOverlap?: boolean;

    /** Width (px) labels truncate to. Must match the left padding the caller reserves for them. */
    maxLabelWidth?: number;
};

function ChartYAxisLabels({
    yTicks,
    yScale,
    chartBounds,
    fontSize,
    fontManager,
    labelColor,
    formatValue,
    leftAlign = false,
    avoidOverlap = false,
    maxLabelWidth = MAX_Y_AXIS_LABEL_WIDTH,
}: ChartYAxisLabelsProps) {
    const formattedLabels = yTicks.map((tick) => formatValue(tick));

    // Truncate to a single line: labels wider than the max would otherwise wrap onto a second line and
    // overflow the row height (positioning below assumes one line).
    const ellipsisWidth = measureTextWidth(ELLIPSIS, fontManager, fontSize);
    const truncatedLabels = formattedLabels.map((label) => truncateLabel(label, measureTextWidth(label, fontManager, fontSize), maxLabelWidth, ellipsisWidth));

    // Lay out at the wide width so the already-truncated labels never wrap.
    const paragraphs = useChartParagraphs(truncatedLabels, fontManager, fontSize, labelColor, MAX_X_AXIS_LABEL_WIDTH);

    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const lineHeight = ascent + descent;

    // When rows are packed tighter than a line of text, show every Nth label so the remaining ones don't overlap.
    const skipInterval = (() => {
        if (!avoidOverlap || yTicks.length <= 1) {
            return 1;
        }
        let minRowSpacing = Infinity;
        for (let i = 1; i < yTicks.length; i++) {
            const gap = Math.abs(yScale(yTicks.at(i) ?? 0) - yScale(yTicks.at(i - 1) ?? 0));
            if (gap > 0) {
                minRowSpacing = Math.min(minRowSpacing, gap);
            }
        }
        const required = lineHeight + LABEL_PADDING;
        if (!Number.isFinite(minRowSpacing) || minRowSpacing >= required) {
            return 1;
        }
        return Math.ceil(required / minRowSpacing);
    })();

    return yTicks.map((tick, i) => {
        if (i % skipInterval !== 0) {
            return null;
        }
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }

        // Left-aligned labels (horizontal bar chart) start at the canvas origin so they sit on the same left
        // key line as the chart title. Right-aligned labels end just inside the plot's left edge.
        const x = leftAlign ? 0 : chartBounds.left + GLYPH_PADDING - paraData.width;
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
