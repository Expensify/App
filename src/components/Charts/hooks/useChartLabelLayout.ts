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
    firstTickOffset?: number;
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
 * Left extent of a rotated label at 45° from its anchor point.
 * At 45° cos and sin are equal (SIN_45), so extent = (labelWidth + lineHeight) * SIN_45.
 */
function leftExtentAt45(labelWidth: number, lineHeight: number): number {
    return (labelWidth + lineHeight) * SIN_45;
}

/**
 * Pick the smallest rotation (0 → 45 → 90) where labels don't overlap,
 * preferring rotation over skip interval.
 */
function pickRotation(maxLabelWidth: number, lineHeight: number, tickSpacing: number, labelArea: number, dataCount: number, minTruncatedWidth: number, firstTickOffset?: number): number {
    // 0°: labels fit horizontally without truncation and first label won't be clipped
    const ew0 = effectiveWidth(maxLabelWidth, lineHeight, LABEL_ROTATIONS.HORIZONTAL);
    const fits0 = ew0 + LABEL_PADDING <= tickSpacing && maxVisibleCount(labelArea, ew0) >= dataCount;
    const firstLabelClipped = firstTickOffset !== undefined && maxLabelWidth > firstTickOffset;
    if (fits0 && !firstLabelClipped) {
        return LABEL_ROTATIONS.HORIZONTAL;
    }

    // 45°: viable if MIN_TRUNCATED_CHARS + ellipsis fits between ticks
    // and the minimum truncated label fits within firstTickOffset
    const minEw45 = minTruncatedWidth * SIN_45;
    const fitsBetweenTicks = minEw45 + LABEL_PADDING <= tickSpacing;
    const fitsFirstTick = firstTickOffset === undefined || leftExtentAt45(minTruncatedWidth, lineHeight) <= firstTickOffset;
    if (fitsBetweenTicks && fitsFirstTick) {
        return LABEL_ROTATIONS.DIAGONAL;
    }

    // 90°: fallback
    return LABEL_ROTATIONS.VERTICAL;
}

function useChartLabelLayout({data, font, tickSpacing, labelAreaWidth, firstTickOffset}: LabelLayoutConfig) {
    return useMemo(() => {
        if (!font || tickSpacing <= 0 || labelAreaWidth <= 0 || data.length === 0) {
            return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: data.map((p) => p.label)};
        }

        const fontMetrics = font.getMetrics();
        const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
        const ellipsisWidth = measureTextWidth(ELLIPSIS, font);
        const labelWidths = data.map((p) => measureTextWidth(p.label, font));
        const maxLabelLength = Math.max(...labelWidths);

        // Maximum width of labels after truncation to MIN_TRUNCATED_CHARS characters.
        // Labels shorter than the threshold keep their full width (can't be truncated further).
        const minTruncatedWidth = Math.max(
            ...data.map((p, i) => {
                if (p.label.length <= MIN_TRUNCATED_CHARS) {
                    return labelWidths.at(i) ?? 0;
                }
                return measureTextWidth(p.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, font);
            }),
        );

        // 1. Pick rotation
        const rotation = pickRotation(maxLabelLength, lineHeight, tickSpacing, labelAreaWidth, data.length, minTruncatedWidth, firstTickOffset);

        // 2. Truncate labels (only at 45°)
        //    Tick-spacing constraint: labelWidth * sin(45°) + padding <= tickSpacing
        //    First-label constraint: (labelWidth + lineHeight) * sin(45°) <= firstTickOffset
        const tickSpacingLimit = rotation === LABEL_ROTATIONS.DIAGONAL ? (tickSpacing - LABEL_PADDING) / SIN_45 : Infinity;
        const firstTickLimit = rotation === LABEL_ROTATIONS.DIAGONAL && firstTickOffset !== undefined ? firstTickOffset / SIN_45 - lineHeight : Infinity;
        const finalLabels = data.map((p, i) => {
            const limit = i === 0 ? Math.min(tickSpacingLimit, firstTickLimit) : tickSpacingLimit;
            return truncateLabel(p.label, labelWidths.at(i) ?? 0, limit, ellipsisWidth);
        });

        // 3. Compute skip interval (only at 90°)
        const finalMaxWidth = Math.max(...finalLabels.map((l) => measureTextWidth(l, font)));
        let skipInterval = 1;
        if (rotation === LABEL_ROTATIONS.VERTICAL) {
            const ew = effectiveWidth(finalMaxWidth, lineHeight, rotation);
            const visible = maxVisibleCount(labelAreaWidth, ew);
            skipInterval = visible >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visible));
        }

        // 4. Compute vertical space needed for x-axis labels
        const xAxisLabelHeight = effectiveHeight(finalMaxWidth, lineHeight, rotation);

        return {
            labelRotation: -rotation,
            labelSkipInterval: skipInterval,
            truncatedLabels: finalLabels,
            xAxisLabelHeight,
        };
    }, [font, tickSpacing, labelAreaWidth, firstTickOffset, data]);
}

export {LABEL_ROTATIONS, useChartLabelLayout};
export type {LabelLayoutConfig};
