import type {SkFont} from '@shopify/react-native-skia';
import {ELLIPSIS, LABEL_PADDING, LABEL_ROTATIONS, MIN_TRUNCATED_CHARS, SIN_45} from '@components/Charts/constants';
import type {ChartDataPoint} from '@components/Charts/types';
import {edgeLabelsFit, edgeMaxLabelWidth, effectiveHeight, effectiveWidth, maxVisibleCount, measureTextWidth, truncateLabel} from '@components/Charts/utils';

type LabelLayoutConfig = {
    /** Chart data points whose labels will be laid out. */
    data: ChartDataPoint[];

    /** Skia font used for measuring label text widths. */
    font: SkFont | null;

    /** Distance in pixels between adjacent tick marks. */
    tickSpacing: number;

    /** Total width in pixels of the plot area where labels are rendered. */
    labelAreaWidth: number;

    /** Pixels from first tick to left edge of canvas. Defaults to Infinity (no constraint). */
    firstTickLeftSpace?: number;

    /** Pixels from last tick to right edge of canvas. Defaults to Infinity (no constraint). */
    lastTickRightSpace?: number;

    /** When true, allows tighter label packing at 45° by accounting for vertical offset between right-aligned labels. */
    allowTightDiagonalPacking?: boolean;
};

function useChartLabelLayout({data, font, tickSpacing, labelAreaWidth, firstTickLeftSpace = Infinity, lastTickRightSpace = Infinity, allowTightDiagonalPacking = false}: LabelLayoutConfig) {
    if (!font || data.length === 0 || tickSpacing <= 0 || labelAreaWidth <= 0) {
        return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: [] as string[]};
    }

    const fontMetrics = font.getMetrics();
    const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
    const ellipsisWidth = measureTextWidth(ELLIPSIS, font);
    const labelWidths = data.map((point) => measureTextWidth(point.label, font));
    const maxLabelWidth = Math.max(...labelWidths);
    const firstLabelWidth = labelWidths.at(0) ?? 0;
    const lastLabelWidth = labelWidths.at(-1) ?? 0;
    const minTruncatedWidth = Math.max(
        ...data.map((point, index) => {
            if (point.label.length <= MIN_TRUNCATED_CHARS) {
                return labelWidths.at(index) ?? 0;
            }
            return measureTextWidth(point.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
        }),
    );

    const firstLabel = data.at(0)?.label ?? '';
    const lastLabel = data.at(-1)?.label ?? '';
    const firstMinTrunc = firstLabel.length <= MIN_TRUNCATED_CHARS ? firstLabelWidth : measureTextWidth(firstLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
    const lastMinTrunc = lastLabel.length <= MIN_TRUNCATED_CHARS ? lastLabelWidth : measureTextWidth(lastLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);

    // --- 1. Pick rotation (prefer 0° → 45° → 90°) ---
    let rotation: number = LABEL_ROTATIONS.VERTICAL;

    const hWidth = effectiveWidth(maxLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL);
    const hFitsInTicks = hWidth + LABEL_PADDING <= tickSpacing && maxVisibleCount(labelAreaWidth, hWidth) >= data.length;
    const hEdgeFits = edgeLabelsFit(firstLabelWidth, lastLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL, firstTickLeftSpace, lastTickRightSpace, false);

    if (hFitsInTicks && hEdgeFits) {
        rotation = LABEL_ROTATIONS.HORIZONTAL;
    } else {
        const diagonalOverlap = allowTightDiagonalPacking ? lineHeight * SIN_45 : 0;
        const minDiagWidth = minTruncatedWidth * SIN_45 - diagonalOverlap;
        const dFitsInTicks = minDiagWidth + LABEL_PADDING <= tickSpacing;

        const firstEdgeMax = edgeMaxLabelWidth(firstTickLeftSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, allowTightDiagonalPacking, 'first');
        const lastEdgeMax = edgeMaxLabelWidth(lastTickRightSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, allowTightDiagonalPacking, 'last');
        const dEdgeFits = firstEdgeMax >= firstMinTrunc && lastEdgeMax >= lastMinTrunc;

        if (dFitsInTicks && dEdgeFits) {
            rotation = LABEL_ROTATIONS.DIAGONAL;
        }
    }

    // --- 2. Truncate labels ---
    const truncDiagonalOverlap = allowTightDiagonalPacking ? lineHeight : 0;
    const tickMaxWidth = rotation === LABEL_ROTATIONS.DIAGONAL ? (tickSpacing - LABEL_PADDING) / SIN_45 + truncDiagonalOverlap : Infinity;

    const finalLabels = data.map((point, index) => {
        let maxWidth = tickMaxWidth;

        if (index === 0) {
            const edgeMax = edgeMaxLabelWidth(firstTickLeftSpace, lineHeight, rotation, allowTightDiagonalPacking, 'first');
            maxWidth = Math.min(maxWidth, edgeMax);
        }
        if (index === data.length - 1) {
            const edgeMax = edgeMaxLabelWidth(lastTickRightSpace, lineHeight, rotation, allowTightDiagonalPacking, 'last');
            maxWidth = Math.min(maxWidth, edgeMax);
        }

        return truncateLabel(point.label, labelWidths.at(index) ?? 0, maxWidth, ellipsisWidth);
    });

    // --- 3. Compute skip interval (only at 90°) ---
    const finalWidths = finalLabels.map((label) => measureTextWidth(label, font));
    const finalMaxWidth = Math.max(...finalWidths);
    let skipInterval = 1;
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        const verticalWidth = effectiveWidth(finalMaxWidth, lineHeight, rotation);
        const visibleCount = maxVisibleCount(labelAreaWidth, verticalWidth);
        skipInterval = visibleCount >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visibleCount));
    }

    // --- 4. Compute vertical space needed for x-axis labels ---
    const xAxisLabelHeight = effectiveHeight(finalMaxWidth, lineHeight, rotation);

    return {
        labelRotation: -rotation,
        labelSkipInterval: skipInterval,
        truncatedLabels: finalLabels,
        xAxisLabelHeight,
    };
}

export {useChartLabelLayout};
export type {LabelLayoutConfig};
