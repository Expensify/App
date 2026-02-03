import type {SkFont} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import {Y_AXIS_LABEL_OFFSET} from '@components/Charts/constants';
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

/** X-axis labels can occupy at most this fraction of container height */
const MAX_LABEL_HEIGHT_RATIO = 0.35;

const ELLIPSIS = '...';

type ChartDataPoint = {
    label: string;
    [key: string]: unknown;
};

type LabelLayoutConfig = {
    data: ChartDataPoint[];
    font: SkFont | null;
    chartWidth: number;
    barAreaWidth: number;
    containerHeight: number;
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

/** How many labels fit side-by-side in `areaWidth` given each takes `itemWidth`. */
function maxVisibleCount(areaWidth: number, itemWidth: number): number {
    return Math.floor(areaWidth / (itemWidth + LABEL_PADDING));
}

/**
 * Pick the smallest rotation (0 → 45 → 90) where labels don't overlap,
 * preferring rotation over skip interval.
 */
function pickRotation(maxLabelWidth: number, lineHeight: number, availableWidthPerLabel: number, labelArea: number, dataCount: number): number {
    const candidates = [LABEL_ROTATIONS.HORIZONTAL, LABEL_ROTATIONS.DIAGONAL, LABEL_ROTATIONS.VERTICAL] as const;
    for (const angle of candidates) {
        const ew = effectiveWidth(maxLabelWidth, lineHeight, angle);
        if (ew <= availableWidthPerLabel && maxVisibleCount(labelArea, ew) >= dataCount) {
            return angle;
        }
    }
    return LABEL_ROTATIONS.VERTICAL;
}

/**
 * Max label pixel width allowed at a given rotation so labels don't exceed
 * `MAX_LABEL_HEIGHT_RATIO` of the container height.
 *
 * Based on Victory's internal allocation formula:
 *   totalHeight = lineHeight + Y_AXIS_LABEL_OFFSET * 2 + labelWidth * sin(angle)
 * (from victory-native-xl/src/cartesian/utils/transformInputData.ts)
 */
function maxAllowedWidth(rotation: number, lineHeight: number, containerHeight: number): number {
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        const budget = containerHeight * MAX_LABEL_HEIGHT_RATIO - (lineHeight + Y_AXIS_LABEL_OFFSET * 2);
        return Math.max(0, budget) / SIN_45;
    }
    // 0° and 90°: no truncation (0° uses skip, 90° expands container)
    return Infinity;
}

function useChartLabelLayout({data, font, chartWidth, barAreaWidth, containerHeight}: LabelLayoutConfig) {
    return useMemo(() => {
        if (!font || chartWidth === 0 || containerHeight === 0 || data.length === 0) {
            return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: data.map((p) => p.label)};
        }

        const fontMetrics = font.getMetrics();
        const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
        const ellipsisWidth = measureTextWidth(ELLIPSIS, font);

        const availableWidthPerLabel = chartWidth / data.length - LABEL_PADDING;
        const labelWidths = data.map((p) => measureTextWidth(p.label, font));
        const maxLabelLength = Math.max(...labelWidths);
        const labelArea = barAreaWidth || chartWidth;

        // 1. Pick rotation
        const rotation = pickRotation(maxLabelLength, lineHeight, availableWidthPerLabel, labelArea, data.length);

        // 2. Truncate labels (only effective at 45°)
        const maxWidth = maxAllowedWidth(rotation, lineHeight, containerHeight);
        const finalLabels = data.map((p, i) => truncateLabel(p.label, labelWidths.at(i) ?? 0, maxWidth, ellipsisWidth));

        // 3. Compute skip interval
        const finalMaxWidth = Math.max(...finalLabels.map((l) => measureTextWidth(l, font)));
        const ew = effectiveWidth(finalMaxWidth, lineHeight, rotation);
        const visible = maxVisibleCount(labelArea, ew);
        const skipInterval = visible >= data.length ? 1 : Math.ceil(data.length / Math.max(1, visible));

        return {
            labelRotation: -rotation,
            labelSkipInterval: skipInterval,
            truncatedLabels: finalLabels,
            maxLabelLength,
        };
    }, [font, chartWidth, barAreaWidth, containerHeight, data]);
}

export {LABEL_ROTATIONS, useChartLabelLayout};
export type {LabelLayoutConfig};
