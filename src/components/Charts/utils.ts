import type {SkFont} from '@shopify/react-native-skia';
import colors from '@styles/theme/colors';
import {ELLIPSIS, LABEL_PADDING, LABEL_ROTATIONS, SIN_45} from './constants';
import type {ChartDataPoint, LabelRotation, PieSlice} from './types';

/**
 * Expensify Chart Color Palette.
 *
 * Shades are ordered (400, 600, 300, 500, 700) so that sequential colors have
 * maximum contrast, making adjacent chart segments easy to distinguish.
 *
 * Within each shade, hues cycle: Yellow, Tangerine, Pink, Green, Ice, Blue.
 */
const CHART_PALETTE: string[] = (() => {
    const shades = [400, 600, 300, 500, 700] as const;
    const hues = ['yellow', 'tangerine', 'pink', 'green', 'ice', 'blue'] as const;

    const palette: string[] = [];

    // Generate the 30 unique combinations (5 shades × 6 hues)
    for (const shade of shades) {
        for (const hue of hues) {
            const colorKey = `${hue}${shade}`;
            if (colors[colorKey]) {
                palette.push(colors[colorKey]);
            }
        }
    }

    return palette;
})();

/**
 * Gets a color from the chart palette based on index.
 * Automatically loops back to the start if the index exceeds 29.
 */
function getChartColor(index: number): string {
    if (CHART_PALETTE.length === 0) {
        return colors.black; // Fallback
    }
    return CHART_PALETTE.at(index % CHART_PALETTE.length) ?? colors.black;
}

/** Default color used for single-color charts (e.g., line chart, single-color bar chart) */
const DEFAULT_CHART_COLOR = getChartColor(5);

/**
 * Measure pixel width of a string via glyph widths.
 * (measureText is not implemented on React Native Web)
 */
function measureTextWidth(text: string, font: SkFont): number {
    const glyphIDs = font.getGlyphIDs(text);
    return font.getGlyphWidths(glyphIDs).reduce((sum, w) => sum + w, 0);
}

/**
 * Post-rotation horizontal translation to center a rotated label on its tick mark.
 *
 * Text baselines sit closer to glyph tops (ascent > descent), so rotating around
 * the baseline end creates asymmetric horizontal extent. This returns the correction
 * to apply as a translateX AFTER rotation.
 */
function rotatedLabelCenterCorrection(ascent: number, descent: number, angleRad: number): number {
    return ((ascent - descent) * Math.sin(angleRad)) / 2;
}

/**
 * Calculate the vertical offset from axis to text baseline that maintains
 * a consistent visual gap regardless of label rotation.
 *
 * At 0°: gap to top of text (ascent above baseline)
 * At 45°: gap to top-right corner after rotation (ascent projects as ascent * cos(45°))
 * At 90°: gap to closest point of vertical text (descent from baseline)
 */
function rotatedLabelYOffset(ascent: number, descent: number, angleRad: number): number {
    if (angleRad === 0) {
        return ascent;
    }
    if (angleRad >= Math.PI / 2) {
        return descent;
    }
    return ascent * Math.cos(angleRad);
}

/**
 * Calculate minimum horizontal domainPadding so that edge data points
 * (and their centered labels) aren't clipped by the chart boundary.
 *
 * @param chartWidth - Total chart width in pixels
 * @param pointCount - Number of data points
 * @param innerPadding - Padding ratio between points (0 for line charts, ~0.3 for bar charts)
 */
function calculateMinDomainPadding(chartWidth: number, pointCount: number, innerPadding = 0): number {
    if (pointCount <= 1) {
        return 0;
    }
    const minPaddingRatio = (1 - innerPadding) / (2 * (pointCount - 1 + innerPadding));
    return Math.ceil(chartWidth * minPaddingRatio);
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
    'worklet';

    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}

/**
 * Check if an angle is within a slice's range (handles wrap-around)
 */
function isAngleInSlice(angle: number, startAngle: number, endAngle: number): boolean {
    'worklet';

    const normalizedAngle = normalizeAngle(angle);
    const normalizedStart = normalizeAngle(startAngle);
    const normalizedEnd = normalizeAngle(endAngle);

    if (normalizedStart === normalizedEnd) {
        return endAngle - startAngle >= 360;
    }
    if (normalizedStart > normalizedEnd) {
        return normalizedAngle >= normalizedStart || normalizedAngle < normalizedEnd;
    }
    return normalizedAngle >= normalizedStart && normalizedAngle < normalizedEnd;
}

/**
 * Find which slice index contains the given cursor position
 */
function findSliceAtPosition(cursorX: number, cursorY: number, centerX: number, centerY: number, radius: number, innerRadius: number, slices: PieSlice[]): number {
    'worklet';

    const dx = cursorX - centerX;
    const dy = cursorY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < innerRadius || distance > radius) {
        return -1;
    }

    const cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    return slices.findIndex((slice) => isAngleInSlice(cursorAngle, slice.startAngle, slice.endAngle));
}

/**
 * Process raw data into pie chart slices sorted by absolute value descending.
 */
function processDataIntoSlices(data: ChartDataPoint[], startAngle: number): PieSlice[] {
    const total = data.reduce((sum, point) => sum + Math.abs(point.total), 0);
    if (total === 0) {
        return [];
    }

    return data
        .map((point, index) => ({label: point.label, absTotal: Math.abs(point.total), originalIndex: index}))
        .sort((a, b) => b.absTotal - a.absTotal)
        .reduce<{slices: PieSlice[]; angle: number}>(
            (acc, slice, index) => {
                const fraction = slice.absTotal / total;
                const sweepAngle = fraction * 360;
                acc.slices.push({
                    label: slice.label,
                    value: slice.absTotal,
                    color: getChartColor(index),
                    percentage: fraction * 100,
                    startAngle: acc.angle,
                    endAngle: acc.angle + sweepAngle,
                    originalIndex: slice.originalIndex,
                });
                acc.angle += sweepAngle;
                return acc;
            },
            {slices: [], angle: startAngle},
        ).slices;
}

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
function effectiveWidth(labelWidth: number, lineHeight: number, rotation: LabelRotation): number {
    if (rotation === LABEL_ROTATIONS.VERTICAL) {
        return lineHeight;
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        return labelWidth * SIN_45;
    }
    return labelWidth;
}

/** Vertical footprint of a label at a given rotation angle. */
function effectiveHeight(labelWidth: number, lineHeight: number, rotation: LabelRotation): number {
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
function labelOverhang(labelWidth: number, lineHeight: number, rotation: LabelRotation, rightAligned: boolean): {left: number; right: number} {
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
function edgeLabelsFit({
    firstLabelWidth,
    lastLabelWidth,
    lineHeight,
    rotation,
    firstTickLeftSpace,
    lastTickRightSpace,
    rightAligned,
}: {
    firstLabelWidth: number;
    lastLabelWidth: number;
    lineHeight: number;
    rotation: LabelRotation;
    firstTickLeftSpace: number;
    lastTickRightSpace: number;
    rightAligned: boolean;
}): boolean {
    const first = labelOverhang(firstLabelWidth, lineHeight, rotation, rightAligned);
    const last = labelOverhang(lastLabelWidth, lineHeight, rotation, rightAligned);
    return first.left <= firstTickLeftSpace && last.right <= lastTickRightSpace;
}

/**
 * Maximum label width that fits within the available edge space at a given rotation.
 * Returns Infinity when the overhang at that edge doesn't depend on label width.
 */
function edgeMaxLabelWidth(edgeSpace: number, lineHeight: number, rotation: LabelRotation, rightAligned: boolean, edge: 'first' | 'last'): number {
    const halfLH = lineHeight / 2;
    if (rotation === LABEL_ROTATIONS.HORIZONTAL) {
        return 2 * edgeSpace;
    }
    if (rotation === LABEL_ROTATIONS.DIAGONAL) {
        if (rightAligned) {
            return edge === 'first' ? Math.max(0, edgeSpace / SIN_45 - halfLH) : Infinity;
        }
        return Math.max(0, 2 * (edgeSpace / SIN_45 - halfLH));
    }
    return Infinity;
}

export {
    getChartColor,
    DEFAULT_CHART_COLOR,
    measureTextWidth,
    rotatedLabelCenterCorrection,
    rotatedLabelYOffset,
    calculateMinDomainPadding,
    normalizeAngle,
    isAngleInSlice,
    findSliceAtPosition,
    processDataIntoSlices,
    truncateLabel,
    effectiveWidth,
    effectiveHeight,
    maxVisibleCount,
    labelOverhang,
    edgeLabelsFit,
    edgeMaxLabelWidth,
};
