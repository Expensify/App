import {FontWeight, Paragraph, Skia} from '@shopify/react-native-skia';
import type {SkParagraph, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {AXIS_LABEL_GAP} from '@components/Charts/constants';

const CHART_FONT_FAMILIES = ['ExpensifyNeue', 'NotoSansSymbols'];

// Small extra padding so complex glyphs (e.g. Arabic) are not clipped.
// getLongestLine() can slightly underreport the visual extent of the last glyph.
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
};

function ChartYAxisLabels({yTicks, yScale, chartBounds, fontSize, fontMgr, labelColor, formatValue}: ChartYAxisLabelsProps) {
    const formattedLabels = useMemo(() => yTicks.map((tick) => formatValue(tick)), [yTicks, formatValue]);

    const paragraphs = useMemo((): Array<{para: SkParagraph; width: number} | null> | null => {
        if (!fontMgr) {
            return null;
        }
        return formattedLabels.map((label) => {
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
            para.layout(9999);
            const width = para.getLongestLine();
            return {para, width};
        });
    }, [fontMgr, formattedLabels, labelColor, fontSize]);

    // Derive line height from the first available paragraph's line metrics.
    const lineHeight = useMemo(() => {
        const firstPara = paragraphs?.find((p) => p !== null);
        const metrics = firstPara?.para.getLineMetrics().at(0);
        return metrics ? Math.abs(metrics.ascent) + Math.abs(metrics.descent) : fontSize;
    }, [paragraphs, fontSize]);

    return yTicks.map((tick, i) => {
        const paraData = paragraphs?.at(i) ?? null;
        if (!paraData) {
            return null;
        }

        // Right-align: paragraph left edge so its right edge sits at chartBounds.left - AXIS_LABEL_GAP
        const x = chartBounds.left - AXIS_LABEL_GAP - paraData.width + 2 * GLYPH_PADDING;
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

export default ChartYAxisLabels;
export type {ChartYAxisLabelsProps};
