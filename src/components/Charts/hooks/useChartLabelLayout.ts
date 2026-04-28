import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {LABEL_PADDING, LABEL_ROTATIONS, SIN_45} from '@components/Charts/constants';
import type {ChartDataPoint, LabelRotation} from '@components/Charts/types';
import {edgeLabelsFit, edgeMaxLabelWidth, effectiveHeight, effectiveWidth, maxVisibleCount} from '@components/Charts/utils';
import type useChartLabelMeasurements from './useChartLabelMeasurements';

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

    /** Measurements of the label text. */
    measurements: ReturnType<typeof useChartLabelMeasurements>;
};

const EMPTY_LAYOUT = {
    labelRotation: LABEL_ROTATIONS.HORIZONTAL,
    labelSkipInterval: 1,
    labelMaxWidths: [] as number[],
    truncatedLabelWidths: [] as number[],
    xAxisLabelHeight: 0,
    regularLabelMaxWidth: Infinity,
    firstLabelMaxWidth: Infinity,
    lastLabelMaxWidth: Infinity,
    ellipsisWidth: 0,
};

function useChartLabelLayout({
    data,
    fontMgr,
    tickSpacing,
    labelAreaWidth,
    firstTickLeftSpace = Infinity,
    lastTickRightSpace = Infinity,
    allowTightDiagonalPacking = false,
    measurements,
}: LabelLayoutConfig) {
    // Phase 1: font/data measurements — stable across geometry-only changes (resize).

    // Phase 2: layout decisions + label truncation.
    // Memoized on all geometry inputs so labelMaxWidths and truncatedLabelWidths have stable
    // references between re-renders where only unrelated state changes.
    if (!fontMgr || !measurements || tickSpacing <= 0 || labelAreaWidth <= 0) {
        return EMPTY_LAYOUT;
    }

    const {lineHeight, labelWidths, maxLabelWidth, firstLabelWidth, lastLabelWidth, minTruncatedWidth, firstMinTrunc, lastMinTrunc, ellipsisWidth} = measurements;

    // With a single data point there are no adjacent labels to overlap, so edge constraints
    // based on canvas boundaries are irrelevant for the rotation decision.
    const effectiveFirstTickLeftSpace = data.length === 1 ? Infinity : firstTickLeftSpace;
    const effectiveLastTickRightSpace = data.length === 1 ? Infinity : lastTickRightSpace;

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

    // Compute per-label max-width constraints (used by ChartXAxisLabels for truncation).
    const truncDiagonalOverlap = allowTightDiagonalPacking ? lineHeight : 0;
    const tickMaxWidth = rotation === LABEL_ROTATIONS.DIAGONAL ? (tickSpacing - LABEL_PADDING) / SIN_45 + truncDiagonalOverlap : Infinity;

    const labelMaxWidths = data.map((_, index) => {
        let maxWidth = tickMaxWidth;
        if (index === 0) {
            const edgeMax = edgeMaxLabelWidth(effectiveFirstTickLeftSpace, lineHeight, rotation, allowTightDiagonalPacking, 'first');
            maxWidth = Math.min(maxWidth, edgeMax);
        }
        if (index === data.length - 1) {
            const edgeMax = edgeMaxLabelWidth(effectiveLastTickRightSpace, lineHeight, rotation, allowTightDiagonalPacking, 'last');
            maxWidth = Math.min(maxWidth, edgeMax);
        }
        return maxWidth;
    });

    // Approximate truncated widths for hit-testing: exact for non-truncated labels,
    // at most ellipsisWidth px over for truncated ones — acceptable for bounding boxes.
    const truncatedLabelWidths = labelMaxWidths.map((maxW, i) => Math.min(labelWidths.at(i) ?? 0, maxW));
    const finalMaxWidth = Math.max(...truncatedLabelWidths);

    let skipInterval = 1;
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        const verticalWidth = effectiveWidth(finalMaxWidth, lineHeight, rotation);
        const visibleCount = maxVisibleCount(labelAreaWidth, verticalWidth);
        skipInterval = visibleCount >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visibleCount));
    }

    const lastIndex = data.length - 1;

    return {
        labelRotation: rotation,
        labelSkipInterval: skipInterval,
        labelMaxWidths,
        truncatedLabelWidths,
        xAxisLabelHeight: effectiveHeight(finalMaxWidth, lineHeight, rotation),
        regularLabelMaxWidth: tickMaxWidth,
        firstLabelMaxWidth: labelMaxWidths.at(0) ?? tickMaxWidth,
        lastLabelMaxWidth: labelMaxWidths.at(lastIndex) ?? tickMaxWidth,
        ellipsisWidth,
    };
}

export {useChartLabelLayout};
export type {LabelLayoutConfig};
