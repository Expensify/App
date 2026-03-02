import type {SkFont} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import type {ChartDataPoint} from '@components/Charts/types';
import {measureTextWidth} from '@components/Charts/utils';

/** Supported label rotation angles in degrees */
const LABEL_ROTATIONS = {
    HORIZONTAL: 0,
    DIAGONAL: 45,
    VERTICAL: 90,
} as const;

const SIN_45 = Math.sin(Math.PI / 4);

/** Minimum gap between adjacent labels (px) */
const LABEL_PADDING = 4;

const ELLIPSIS = '...';

/** Minimum visible characters (excluding ellipsis) for truncation to be worthwhile */
const MIN_TRUNCATED_CHARS = 10;

type LabelLayoutConfig = {
    data: ChartDataPoint[];
    font: SkFont | null;
    tickSpacing: number;
    labelAreaWidth: number;
    /** Pixels from first tick to left edge of canvas. Defaults to Infinity (no constraint). */
    firstTickLeftSpace?: number;
    /** Pixels from last tick to right edge of canvas. Defaults to Infinity (no constraint). */
    lastTickRightSpace?: number;
    /** When true, allows tighter label packing at 45° by accounting for vertical offset between right-aligned labels. */
    allowTightDiagonalPacking?: boolean;
};

/** Truncate `label` so its pixel width fits within `maxWidth`, adding ellipsis. */
function truncateLabel(label: string, labelWidth: number, maxWidth: number, ellipsisWidth: number): string {
    if (labelWidth <= maxWidth) {
        return label;
    }
    const available = maxWidth - ellipsisWidth;
    if (available <= 0) {
        return ELLIPSIS;
    }
    const maxChars = Math.max(1, Math.floor(label.length * (available / labelWidth)));
    return label.slice(0, maxChars) + ELLIPSIS;
}

/** Horizontal footprint of a label at a given rotation angle (for inter-tick overlap checks). */
function effectiveWidth(labelWidth: number, lineHeight: number, rotation: number): number {
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        return lineHeight;
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        return labelWidth * SIN_45;
    }
    return labelWidth;
}

/** Vertical footprint of a label at a given rotation angle. */
function effectiveHeight(labelWidth: number, lineHeight: number, rotation: number): number {
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        return labelWidth;
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        return labelWidth * SIN_45 + lineHeight * SIN_45;
    }
    return lineHeight;
}

/** How many labels fit side-by-side in `areaWidth` given each takes `itemWidth`. */
function maxVisibleCount(areaWidth: number, itemWidth: number): number {
    return Math.floor(areaWidth / (itemWidth + LABEL_PADDING));
}

/**
 * How far a label extends beyond its tick position after rotation.
 * Accounts for the rotatedLabelCenterCorrection translateX applied during rendering.
 */
function labelOverhang(labelWidth: number, lineHeight: number, rotation: number, rightAligned: boolean): {left: number; right: number} {
    if (rotation === LABEL_ROTATIONS.HORIZONTAL) {
        return {left: labelWidth / 2, right: labelWidth / 2};
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        const halfLH = lineHeight / 2;
        if (rightAligned) {
            return {
                left: (labelWidth + halfLH) * SIN_45,
                right: halfLH * SIN_45,
            };
        }
        const overhang = (labelWidth / 2 + halfLH) * SIN_45;
        return {left: overhang, right: overhang};
    }
    return {left: lineHeight / 2, right: lineHeight / 2};
}

/** Check if first and last labels fit within the available canvas edge space. */
function edgeLabelsFit(
    firstLabelWidth: number,
    lastLabelWidth: number,
    lineHeight: number,
    rotation: number,
    firstTickLeftSpace: number,
    lastTickRightSpace: number,
    rightAligned: boolean,
): boolean {
    const first = labelOverhang(firstLabelWidth, lineHeight, rotation, rightAligned);
    const last = labelOverhang(lastLabelWidth, lineHeight, rotation, rightAligned);
    return first.left <= firstTickLeftSpace && last.right <= lastTickRightSpace;
}

/**
 * Maximum label width that fits within the available edge space at a given rotation.
 * Returns Infinity when the overhang at that edge doesn't depend on label width.
 */
function edgeMaxLabelWidth(edgeSpace: number, lineHeight: number, rotation: number, rightAligned: boolean, edge: 'first' | 'last'): number {
    const halfLH = lineHeight / 2;
    if (rotation === LABEL_ROTATIONS.HORIZONTAL) {
        return 2 * edgeSpace;
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        if (rightAligned) {
            // Right-aligned: only first label can overflow left, last label's right overhang is constant
            return edge === 'first' ? Math.max(0, edgeSpace / SIN_45 - halfLH) : Infinity;
        }
        // Centered: symmetric overhang on both edges
        return Math.max(0, 2 * (edgeSpace / SIN_45 - halfLH));
    }
    // Vertical: overhang is lineHeight/2, doesn't depend on label width
    return Infinity;
}

function useChartLabelLayout({data, font, tickSpacing, labelAreaWidth, firstTickLeftSpace = Infinity, lastTickRightSpace = Infinity, allowTightDiagonalPacking = false}: LabelLayoutConfig) {
    return useMemo(() => {
        if (!font || data.length === 0 || tickSpacing <= 0 || labelAreaWidth <= 0) {
            return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: []};
        }

        const fontMetrics = font.getMetrics();
        const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
        const ellipsisWidth = measureTextWidth(ELLIPSIS, font);
        const labelWidths = data.map((point) => measureTextWidth(point.label, font));
        const maxLabelWidth = Math.max(...labelWidths);
        const firstLabelWidth = labelWidths.at(0) ?? 0;
        const lastLabelWidth = labelWidths.at(-1) ?? 0;
        const rightAligned = allowTightDiagonalPacking;

        // Maximum width of labels after truncation to MIN_TRUNCATED_CHARS characters.
        const minTruncatedWidth = Math.max(
            ...data.map((point, index) => {
                if (point.label.length <= MIN_TRUNCATED_CHARS) {
                    return labelWidths.at(index) ?? 0;
                }
                return measureTextWidth(point.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
            }),
        );

        // Min truncated widths for edge labels specifically
        const firstLabel = data.at(0)?.label ?? '';
        const lastLabel = data.at(-1)?.label ?? '';
        const firstMinTrunc = firstLabel.length <= MIN_TRUNCATED_CHARS ? firstLabelWidth : measureTextWidth(firstLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
        const lastMinTrunc = lastLabel.length <= MIN_TRUNCATED_CHARS ? lastLabelWidth : measureTextWidth(lastLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);

        // --- 1. Pick rotation (prefer 0° → 45° → 90°) ---
        let rotation: number = LABEL_ROTATIONS.VERTICAL;

        // 0°: labels fit horizontally without truncation AND edge labels fit
        const hWidth = effectiveWidth(maxLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL);
        const hFitsInTicks = hWidth + LABEL_PADDING <= tickSpacing && maxVisibleCount(labelAreaWidth, hWidth) >= data.length;
        const hEdgeFits = edgeLabelsFit(firstLabelWidth, lastLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL, firstTickLeftSpace, lastTickRightSpace, false);

        if (hFitsInTicks && hEdgeFits) {
            rotation = LABEL_ROTATIONS.HORIZONTAL;
        } else {
            // 45°: viable if MIN_TRUNCATED_CHARS + ellipsis fits between ticks
            const diagonalOverlap = allowTightDiagonalPacking ? lineHeight * SIN_45 : 0;
            const minDiagWidth = minTruncatedWidth * SIN_45 - diagonalOverlap;
            const dFitsInTicks = minDiagWidth + LABEL_PADDING <= tickSpacing;

            // Edge check: can first/last labels show at least MIN_TRUNCATED_CHARS at 45°?
            const firstEdgeMax = edgeMaxLabelWidth(firstTickLeftSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, rightAligned, 'first');
            const lastEdgeMax = edgeMaxLabelWidth(lastTickRightSpace, lineHeight, LABEL_ROTATIONS.DIAGONAL, rightAligned, 'last');
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

            // Apply edge constraints for first/last labels
            if (index === 0) {
                const edgeMax = edgeMaxLabelWidth(firstTickLeftSpace, lineHeight, rotation, rightAligned, 'first');
                maxWidth = Math.min(maxWidth, edgeMax);
            }
            if (index === data.length - 1) {
                const edgeMax = edgeMaxLabelWidth(lastTickRightSpace, lineHeight, rotation, rightAligned, 'last');
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
    }, [font, tickSpacing, labelAreaWidth, firstTickLeftSpace, lastTickRightSpace, data, allowTightDiagonalPacking]);
}

export {LABEL_ROTATIONS, useChartLabelLayout};
export type {LabelLayoutConfig};
