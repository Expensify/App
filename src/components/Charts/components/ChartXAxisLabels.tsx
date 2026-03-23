import {FontWeight, Group, Paragraph, Skia, vec} from '@shopify/react-native-skia';
import type {SkParagraph, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import {AXIS_LABEL_GAP, CHART_FONT_FAMILIES, MAX_X_AXIS_LABEL_WIDTH} from '@components/Charts/constants';
import type {LabelRotation} from '@components/Charts/types';
import {rotatedLabelCenterCorrection, rotatedLabelYOffset} from '@components/Charts/utils';

type ParagraphWithWidth = {para: SkParagraph; width: number};

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
    fontMgr?: SkTypefaceFontProvider | null;

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

    const paragraphs = useMemo((): Array<ParagraphWithWidth | null> | null => {
        if (!fontMgr) {
            return null;
        }
        return labels.map((label) => {
            if (label.length === 0) {
                return null;
            }
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
            para.layout(MAX_X_AXIS_LABEL_WIDTH);
            return {para, width: para.getLongestLine()};
        });
    }, [fontMgr, labels, labelColor, fontSize]);

    const labelWidths = useMemo(() => {
        return labels.map((_, i) => paragraphs?.at(i)?.width ?? 0);
    }, [labels, paragraphs]);

    // Derive ascent/descent from the first available paragraph's line metrics.
    const {ascent, descent} = useMemo(() => {
        const firstPara = paragraphs?.find((p) => p !== null);
        const metrics = firstPara?.para.getLineMetrics().at(0);
        return {
            ascent: Math.abs(metrics?.ascent ?? fontSize * 0.8),
            descent: Math.abs(metrics?.descent ?? fontSize * 0.2),
        };
    }, [paragraphs, fontSize]);

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
                    key={`x-label-${label.replaceAll(' ', '-')}-${tickX}`}
                    paragraph={paraData.para}
                    x={tickX - renderWidth / 2}
                    y={labelY}
                    width={renderWidth + 1}
                />
            );
        }

        const textX = centerRotatedLabels ? tickX - renderWidth / 2 : tickX - renderWidth;
        const origin = vec(tickX, labelY);

        return (
            <Group
                key={`x-label-${label.replaceAll(' ', '-')}-${tickX}`}
                origin={origin}
                transform={[{translateX: correction}, {rotate: -angleRad}]}
            >
                <Paragraph
                    paragraph={paraData.para}
                    x={textX}
                    y={labelY - ascent}
                    width={renderWidth + 1}
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
