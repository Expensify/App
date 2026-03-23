import {FontWeight, Paragraph, Skia} from '@shopify/react-native-skia';
import type {SkParagraph, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {AXIS_LABEL_GAP, CHART_FONT_FAMILIES, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/constants';

// Small extra padding so complex glyphs (e.g. Arabic) are not clipped.
// getLongestLine() can slightly under-report the visual extent of the last glyph.
const GLYPH_PADDING = 4;

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
    fontMgr?: SkTypefaceFontProvider | null;

    /** Fill color for the label text. */
    labelColor: string;

    /** Formats a tick value to its display string. */
    formatValue: (value: number) => string;

    /** When true, labels are left-aligned starting at chartBounds.left + AXIS_LABEL_GAP instead of right-aligned. */
    leftAlign?: boolean;
};

function ChartYAxisLabels({yTicks, yScale, chartBounds, fontSize, fontMgr, labelColor, formatValue, leftAlign = false}: ChartYAxisLabelsProps) {
    const formattedLabels = useMemo(() => yTicks.map((tick) => formatValue(tick)), [yTicks, formatValue]);

    const paragraphs = useMemo((): {items: Array<{para: SkParagraph; width: number}>; maxWidth: number} | null => {
        if (!fontMgr) {
            return null;
        }
        const items = formattedLabels.map((label) => {
            const para = Skia.ParagraphBuilder.Make({}, fontMgr)
                .pushStyle({
                    color: Skia.Color(labelColor),
                    fontFamilies: CHART_FONT_FAMILIES,
                    fontStyle: {weight: FontWeight.Normal},
                    fontSize,
                })
                .addText(label)
                .pop()
                .build();
            para.layout(MAX_Y_AXIS_LABEL_WIDTH);
            const width = para.getLongestLine();
            return {para, width};
        });
        const maxWidth = Math.max(0, ...items.map((item) => item.width));
        return {items, maxWidth};
    }, [fontMgr, formattedLabels, labelColor, fontSize]);

    // Derive line height from the first available paragraph's line metrics.
    const lineHeight = useMemo(() => {
        const firstPara = paragraphs?.items.at(0);
        const metrics = firstPara?.para.getLineMetrics().at(0);
        return metrics ? Math.abs(metrics.ascent) + Math.abs(metrics.descent) : fontSize;
    }, [paragraphs, fontSize]);

    return yTicks.map((tick, i) => {
        const paraData = paragraphs?.items.at(i) ?? null;
        if (!paraData) {
            return null;
        }

        const x = chartBounds.left - AXIS_LABEL_GAP - 2 * GLYPH_PADDING - (leftAlign ? (paragraphs?.maxWidth ?? 0) : paraData.width);
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
