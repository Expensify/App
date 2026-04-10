import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {ELLIPSIS, LABEL_PADDING, LABEL_ROTATIONS, MIN_TRUNCATED_CHARS, SIN_45} from '@components/Charts/constants';
import type {ChartDataPoint, LabelRotation} from '@components/Charts/types';
import {edgeLabelsFit, edgeMaxLabelWidth, effectiveHeight, effectiveWidth, getFontLineMetrics, maxVisibleCount, measureTextWidth, truncateLabel} from '@components/Charts/utils';

type LabelLayoutConfig = {
    /** Chart data points whose labels will be laid out. */
    data: ChartDataPoint[];

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontMgr: SkTypefaceFontProvider | null;

    /** Font size used for measuring label text widths. */
    fontSize: number;

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

function useChartLabelLayout({
    data,
    fontMgr,
    fontSize,
    tickSpacing,
    labelAreaWidth,
    firstTickLeftSpace = Infinity,
    lastTickRightSpace = Infinity,
    allowTightDiagonalPacking = false,
}: LabelLayoutConfig) {
    if (!fontMgr || data.length === 0 || tickSpacing <= 0 || labelAreaWidth <= 0) {
        return {labelRotation: LABEL_ROTATIONS.HORIZONTAL, labelSkipInterval: 1, truncatedLabels: [] as string[]};
    }

    // With a single data point there are no adjacent labels to overlap, so edge constraints
    // based on canvas boundaries are irrelevant for the rotation decision.
    const effectiveFirstTickLeftSpace = data.length === 1 ? Infinity : firstTickLeftSpace;
    const effectiveLastTickRightSpace = data.length === 1 ? Infinity : lastTickRightSpace;

    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
    const lineHeight = Math.abs(ascent) + Math.abs(descent);
    const ellipsisWidth = measureTextWidth(ELLIPSIS, fontMgr, fontSize);
    const labelWidths = data.map((point) => measureTextWidth(point.label, fontMgr, fontSize));
    const maxLabelWidth = Math.max(...labelWidths);
    const firstLabelWidth = labelWidths.at(0) ?? 0;
    const lastLabelWidth = labelWidths.at(-1) ?? 0;
    const minTruncatedWidth = Math.max(
        ...data.map((point, index) => {
            if (point.label.length <= MIN_TRUNCATED_CHARS) {
                return labelWidths.at(index) ?? 0;
            }
            return measureTextWidth(point.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);
        }),
    );

    const firstLabel = data.at(0)?.label ?? '';
    const lastLabel = data.at(-1)?.label ?? '';
    const firstMinTrunc = firstLabel.length <= MIN_TRUNCATED_CHARS ? firstLabelWidth : measureTextWidth(firstLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);
    const lastMinTrunc = lastLabel.length <= MIN_TRUNCATED_CHARS ? lastLabelWidth : measureTextWidth(lastLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);

    // Pick rotation (prefer 0° → 45° → 90°)
    let rotation: LabelRotation = LABEL_ROTATIONS.VERTICAL;

    const hWidth = effectiveWidth(maxLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL);
    const hFitsInTicks = hWidth + LABEL_PADDING <= tickSpacing && maxVisibleCount(labelAreaWidth, hWidth) >= data.length;
    const hEdgeFits = edgeLabelsFit({
        firstLabelWidth,
        lastLabelWidth,
        lineHeight,
        rotation: LABEL_ROTATIONS.HORIZONTAL,
        firstTickLeftSpace: effectiveFirstTickLeftSpace,
        lastTickRightSpace: effectiveLastTickRightSpace,
        rightAligned: false,
    });

    if (hFitsInTicks && hEdgeFits) {
        rotation = LABEL_ROTATIONS.HORIZONTAL;
    } else {
        const diagonalOverlap = allowTightDiagonalPacking ? lineHeight * SIN_45 : 0;
        const minDiagWidth = minTruncatedWidth * SIN_45 - diagonalOverlap;
        const dFitsInTicks = minDiagWidth + LABEL_PADDING <= tickSpacing;

        const firstEdgeMax = edgeMaxLabelWidth(effectiveFirstTickLeftSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, allowTightDiagonalPacking, 'first');
        const lastEdgeMax = edgeMaxLabelWidth(effectiveLastTickRightSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, allowTightDiagonalPacking, 'last');
        const dEdgeFits = firstEdgeMax >= firstMinTrunc && lastEdgeMax >= lastMinTrunc;

        if (dFitsInTicks && dEdgeFits) {
            rotation = LABEL_ROTATIONS.DIAGONAL;
        }
    }

    // Truncate labels
    const truncDiagonalOverlap = allowTightDiagonalPacking ? lineHeight : 0;
    const tickMaxWidth = rotation === LABEL_ROTATIONS.DIAGONAL ? (tickSpacing - LABEL_PADDING) / SIN_45 + truncDiagonalOverlap : Infinity;

    const finalLabels = data.map((point, index) => {
        let maxWidth = tickMaxWidth;

        if (index === 0) {
            const edgeMax = edgeMaxLabelWidth(effectiveFirstTickLeftSpace, lineHeight, rotation, allowTightDiagonalPacking, 'first');
            maxWidth = Math.min(maxWidth, edgeMax);
        }
        if (index === data.length - 1) {
            const edgeMax = edgeMaxLabelWidth(effectiveLastTickRightSpace, lineHeight, rotation, allowTightDiagonalPacking, 'last');
            maxWidth = Math.min(maxWidth, edgeMax);
        }

        return truncateLabel(point.label, labelWidths.at(index) ?? 0, maxWidth, ellipsisWidth);
    });

    // Compute skip interval (only at 90°)
    const finalWidths = finalLabels.map((label) => measureTextWidth(label, fontMgr, fontSize));
    const finalMaxWidth = Math.max(...finalWidths);
    let skipInterval = 1;
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        const verticalWidth = effectiveWidth(finalMaxWidth, lineHeight, rotation);
        const visibleCount = maxVisibleCount(labelAreaWidth, verticalWidth);
        skipInterval = visibleCount >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visibleCount));
    }

    // Compute vertical space needed for x-axis labels
    const xAxisLabelHeight = effectiveHeight(finalMaxWidth, lineHeight, rotation);

    return {
        labelRotation: rotation,
        labelSkipInterval: skipInterval,
        truncatedLabels: finalLabels,
        xAxisLabelHeight,
    };
}

export {useChartLabelLayout};
export type {LabelLayoutConfig};
