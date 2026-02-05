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
    /** When true, allows tighter label packing at 45° by accounting for vertical offset. Useful for line charts. */
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

/** Horizontal footprint of a label at a given rotation angle. */
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
 * Pick the smallest rotation (0 → 45 → 90) where labels don't overlap,
 * preferring rotation over skip interval.
 */
function pickRotation(
    maxLabelWidth: number,
    lineHeight: number,
    tickSpacing: number,
    labelArea: number,
    dataCount: number,
    minTruncatedWidth: number,
    allowTightDiagonalPacking: boolean,
): number {
    // 0°: labels fit horizontally without truncation
    const horizontalWidth = effectiveWidth(maxLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL);
    if (horizontalWidth + LABEL_PADDING <= tickSpacing && maxVisibleCount(labelArea, horizontalWidth) >= dataCount) {
        return LABEL_ROTATIONS.HORIZONTAL;
    }

    // 45°: viable if MIN_TRUNCATED_CHARS + ellipsis fits between ticks
    // With tight packing, labels can overlap horizontally by lineHeight * sin(45°) due to vertical offset
    const diagonalOverlap = allowTightDiagonalPacking ? lineHeight * SIN_45 : 0;
    const minDiagonalWidth = minTruncatedWidth * SIN_45 - diagonalOverlap;
    if (minDiagonalWidth + LABEL_PADDING <= tickSpacing) {
        return LABEL_ROTATIONS.DIAGONAL;
    }

    // 90°: fallback
    return LABEL_ROTATIONS.VERTICAL;
}

function useChartLabelLayout({data, font, tickSpacing, labelAreaWidth, allowTightDiagonalPacking = false}: LabelLayoutConfig) {
    return useMemo(() => {
        if (!font || data.length === 0 || tickSpacing <= 0 || labelAreaWidth <= 0) {
            return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: []};
        }

        const fontMetrics = font.getMetrics();
        const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
        const ellipsisWidth = measureTextWidth(ELLIPSIS, font);
        const labelWidths = data.map((point) => measureTextWidth(point.label, font));
        const maxLabelLength = Math.max(...labelWidths);

        // Maximum width of labels after truncation to MIN_TRUNCATED_CHARS characters.
        // Labels shorter than the threshold keep their full width (can't be truncated further).
        const minTruncatedWidth = Math.max(
            ...data.map((point, index) => {
                if (point.label.length <= MIN_TRUNCATED_CHARS) {
                    return labelWidths.at(index) ?? 0;
                }
                return measureTextWidth(point.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
            }),
        );

        // 1. Pick rotation
        const rotation = pickRotation(maxLabelLength, lineHeight, tickSpacing, labelAreaWidth, data.length, minTruncatedWidth, allowTightDiagonalPacking);

        // 2. Truncate labels (only at 45°)
        //    With tight packing, labels can be longer due to allowed horizontal overlap
        const diagonalOverlap = allowTightDiagonalPacking ? lineHeight : 0;
        const maxLabelWidth = rotation === LABEL_ROTATIONS.DIAGONAL ? (tickSpacing - LABEL_PADDING) / SIN_45 + diagonalOverlap : Infinity;
        const finalLabels = data.map((point, index) => {
            return truncateLabel(point.label, labelWidths.at(index) ?? 0, maxLabelWidth, ellipsisWidth);
        });

        // 3. Compute skip interval (only at 90°)
        const finalMaxWidth = Math.max(...finalLabels.map((label) => measureTextWidth(label, font)));
        let skipInterval = 1;
        if (rotation === LABEL_ROTATIONS.VERTICAL) {
            const verticalWidth = effectiveWidth(finalMaxWidth, lineHeight, rotation);
            const visibleCount = maxVisibleCount(labelAreaWidth, verticalWidth);
            skipInterval = visibleCount >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visibleCount));
        }

        // 4. Compute vertical space needed for x-axis labels
        const xAxisLabelHeight = effectiveHeight(finalMaxWidth, lineHeight, rotation);

        return {
            labelRotation: -rotation,
            labelSkipInterval: skipInterval,
            truncatedLabels: finalLabels,
            xAxisLabelHeight,
        };
    }, [font, tickSpacing, labelAreaWidth, data, allowTightDiagonalPacking]);
}

export {LABEL_ROTATIONS, useChartLabelLayout};
export type {LabelLayoutConfig};
