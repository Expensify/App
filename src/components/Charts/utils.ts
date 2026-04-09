import {FontStyle, FontWeight, Skia} from '@shopify/react-native-skia';
import type {SkParagraph, SkParagraphBuilder, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {CHART_FONT_FAMILIES, DIAGONAL_ANGLE_RADIAN_THRESHOLD, ELLIPSIS, LABEL_PADDING, LABEL_ROTATIONS, MAX_X_AXIS_LABEL_WIDTH, PIE_CHART_TOOLTIP_RADIUS_DISTANCE, SIN_45} from './constants';
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

/** One reusable ParagraphBuilder per fontMgr instance. Auto-GC'd when fontMgr is released. */
const builderCache = new WeakMap<SkTypefaceFontProvider, SkParagraphBuilder>();

/**
 * Builds a Skia paragraph for chart labels.
 * Encapsulates the shared font configuration (families, weight, size, optional color).
 * The caller is responsible for calling `para.layout(width)` before measuring or rendering.
 *
 * Reuses a cached ParagraphBuilder per fontMgr (via reset()) to avoid allocating a new
 * builder on every call.
 */
function buildChartParagraph(text: string, fontMgr: SkTypefaceFontProvider, fontSize: number, color?: string): SkParagraph {
    let builder = builderCache.get(fontMgr);
    if (!builder) {
        builder = Skia.ParagraphBuilder.Make({}, fontMgr);
        builderCache.set(fontMgr, builder);
    } else {
        builder.reset();
    }
    return builder
        .pushStyle({
            fontFamilies: CHART_FONT_FAMILIES,
            fontStyle: {weight: FontWeight.Normal},
            fontSize,
            ...(color !== undefined ? {color: Skia.Color(color)} : {}),
        })
        .addText(text)
        .pop()
        .build();
}

/**
 * Calculates the additional offset to apply to the label to center it on the tick mark.
 * @param angleRad - The angle of the label in radians.
 * @returns The additional offset in pixels.
 *
 * @description
 * Skia's paragraph.paint(canvas, x, y) treats `y` as the top of the paragraph bounding box,
 * not the text baseline. The baseline sits at `LineMetrics.baseline` pixels below `y`, and
 * the visual top of the glyphs is at `y + baseline - ascent`. When `baseline > ascent` there
 * is a small gap (leading) between `y` and where the text actually appears.
 * This offset empirically corrects the hit-area center to match the visual center of the
 * rendered label. The sign and magnitude differ per rotation because the gap projects
 * geometrically differently after the transform:
 * 0°  - small downward shift (top of bounding box is above visual center)
 * 45° - shift hit area DOWN (rotation flips the projection)
 * 90° - small downward shift
 */
function getAdditionalOffset(angleRad: number): number {
    if (angleRad === 0) {
        return variables.iconSizeExtraSmall / 3;
    }
    if (angleRad > 0 && angleRad < DIAGONAL_ANGLE_RADIAN_THRESHOLD) {
        return variables.iconSizeExtraSmall / 1.5;
    }
    return variables.iconSizeExtraSmall / 3;
}
/**
 * Checks whether every character in `text` can be rendered by at least one font
 * in the chart font chain (CHART_FONT_FAMILIES).
 *
 * For each character, iterates through each registered font family and calls
 * `Typeface.getGlyphIDs()`. A glyph ID of 0 means the font has no glyph for
 * that code point. If at least one font in the chain returns a non-zero
 * ID for every character, the text is considered fully renderable.
 *
 * Returns `true` when `text` is empty/nullish (nothing to render).
 */
function canFontRenderText(text: string | undefined, fontMgr: SkTypefaceFontProvider): boolean {
    if (!text) {
        return true;
    }

    const typefaces = CHART_FONT_FAMILIES.map((family) => fontMgr.matchFamilyStyle(family, FontStyle.Normal));

    for (const char of text) {
        const isRenderable = typefaces.some((typeface) => typeface?.getGlyphIDs(char).some((id) => id !== 0));
        if (!isRenderable) {
            return false;
        }
    }

    return true;
}

/**
 * Measures the rendered pixel width of a string using the Paragraph API.
 * Supports multi-font fallback via fontMgr (e.g. NotoSansSymbols for currency glyphs).
 */
function measureTextWidth(text: string, fontMgr: SkTypefaceFontProvider, fontSize: number): number {
    const para = buildChartParagraph(text, fontMgr, fontSize);
    para.layout(MAX_X_AXIS_LABEL_WIDTH);
    return para.getLongestLine();
}

/**
 * Returns ascent and descent for the chart font at the given size.
 * Uses a representative string so Skia resolves the actual glyph metrics.
 */
function getFontLineMetrics(fontMgr: SkTypefaceFontProvider, fontSize: number): {ascent: number; descent: number} {
    const para = buildChartParagraph('Ag', fontMgr, fontSize);
    para.layout(MAX_X_AXIS_LABEL_WIDTH);
    const metrics = para.getLineMetrics().at(0);
    return {
        ascent: metrics ? Math.abs(metrics.ascent) : fontSize,
        descent: metrics ? Math.abs(metrics.descent) : 0,
    };
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
function processDataIntoSlices(data: ChartDataPoint[], startAngle: number, pieGeometry: {centerX: number; centerY: number; radius: number}): PieSlice[] {
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
                const angle = acc.angle + sweepAngle / 2;
                const tooltipX = pieGeometry.centerX + pieGeometry.radius * PIE_CHART_TOOLTIP_RADIUS_DISTANCE * Math.cos((angle * Math.PI) / 180);
                const tooltipY = pieGeometry.centerY + pieGeometry.radius * PIE_CHART_TOOLTIP_RADIUS_DISTANCE * Math.sin((angle * Math.PI) / 180);
                acc.slices.push({
                    label: slice.label,
                    value: slice.absTotal,
                    color: getChartColor(index),
                    percentage: fraction * 100,
                    startAngle: acc.angle,
                    endAngle: acc.angle + sweepAngle,
                    originalIndex: slice.originalIndex,
                    ordinalIndex: index,
                    tooltipPosition: {x: tooltipX, y: tooltipY},
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
// Point-in-convex-polygon test using cross products
// Vertices in clockwise order: rightUpper -> rightLower -> leftLower -> leftUpper
function isCursorInSkewedLabel(cursorX: number, cursorY: number, corners: Array<{x: number; y: number}>): boolean {
    'worklet';

    let sign = 0;
    for (let i = 0; i < corners.length; i++) {
        const a = corners.at(i);
        const b = corners.at((i + 1) % corners.length);
        if (a == null || b == null) {
            continue;
        }
        const cross = (b.x - a.x) * (cursorY - a.y) - (b.y - a.y) * (cursorX - a.x);
        if (cross !== 0) {
            const crossSign = cross > 0 ? 1 : -1;
            if (sign === 0) {
                sign = crossSign;
            } else if (crossSign !== sign) {
                return false;
            }
        }
    }
    return true;
}

/** Params for axis-aligned and 45° label hit-test; 90° uses yMin90/yMax90. */
type ChartLabelHitTestParams = {
    cursorX: number;
    cursorY: number;
    targetX: number;
    labelY: number;
    angleRad: number;
    halfWidth: number;
    padding: number;
    /** For 45°: corners [rightUpper, rightLower, leftLower, leftUpper]. */
    corners45?: Array<{x: number; y: number}>;
    /** For 90° vertical label: vertical bounds. */
    yMin90: number;
    yMax90: number;
};

/**
 * Shared hit-test for chart x-axis labels at 0°, 45°, or 90°.
 * Used by BarChart and LineChart to detect cursor over rotated labels.
 */
function isCursorOverChartLabel({cursorX, cursorY, targetX, labelY, angleRad, halfWidth, padding, corners45, yMin90, yMax90}: ChartLabelHitTestParams): boolean {
    'worklet';

    if (angleRad === 0) {
        return cursorY >= labelY - padding && cursorY <= labelY + padding && cursorX >= targetX - halfWidth && cursorX <= targetX + halfWidth;
    }
    if (angleRad < 1 && corners45?.length === 4) {
        return isCursorInSkewedLabel(cursorX, cursorY, corners45);
    }
    // 90°
    return cursorX >= targetX - padding && cursorX <= targetX + padding && cursorY >= yMin90 && cursorY <= yMax90;
}

/**
 * Computes the D3 nice step size for a given range and tick count.
 * Mirrors D3's tickStep logic (1 / 2 / 5 / 10 multiples of the magnitude).
 */
function getNiceStep(range: number, tickCount: number): number {
    const intervals = tickCount - 1;
    const roughStep = range / intervals;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;
    // D3 nice steps: 1, 2, 5, 10 (powers of 10)
    if (normalized >= 5) {
        return 5 * magnitude;
    }
    if (normalized >= 2) {
        return 2 * magnitude;
    }
    return magnitude;
}

/**
 * Predicts the highest Y-axis tick value that Victory-native will generate.
 *
 * Victory (via D3) applies a "nice" algorithm that rounds the domain upper bound up
 * to the next clean tick step. Pass rawMin when negative values are present so that
 * the step is computed from the full range (rawMax − rawMin) rather than rawMax alone.
 */
function getNiceUpperBound(rawMax: number, tickCount: number, rawMin = 0): number {
    const range = rawMax - rawMin;
    if (range <= 0 || tickCount <= 1) {
        return rawMax;
    }
    const niceStep = getNiceStep(range, tickCount);
    return Math.ceil(rawMax / niceStep) * niceStep;
}

/**
 * Predicts the lowest Y-axis tick value that Victory-native will generate.
 *
 * Mirrors D3's nice algorithm for the lower domain bound: floors rawMin to the
 * nearest nice step derived from the full range (rawMax − rawMin).
 */
function getNiceLowerBound(rawMin: number, tickCount: number, rawMax = 0): number {
    if (rawMin >= 0) {
        return rawMin;
    }
    const range = rawMax - rawMin;
    if (range <= 0 || tickCount <= 1) {
        return rawMin;
    }
    const niceStep = getNiceStep(range, tickCount);
    return Math.floor(rawMin / niceStep) * niceStep;
}

/**
 * Returns the pixel width needed for Y-axis labels given the data extremes.
 *
 * Both nice bounds are measured because negative labels (e.g. "−2 000 zł") are
 * typically wider than their positive counterparts. Pass rawDataMin = 0 when
 * there are no negative values.
 */
function getYAxisLabelWidth(rawDataMax: number, rawDataMin: number, tickCount: number, formatValue: (value: number) => string, fontMgr: SkTypefaceFontProvider, fontSize: number): number {
    const niceMax = getNiceUpperBound(rawDataMax, tickCount, rawDataMin);
    const niceMin = getNiceLowerBound(rawDataMin, tickCount, rawDataMax);
    return Math.max(measureTextWidth(formatValue(niceMax), fontMgr, fontSize), measureTextWidth(formatValue(niceMin), fontMgr, fontSize));
}

export {
    getChartColor,
    DEFAULT_CHART_COLOR,
    buildChartParagraph,
    canFontRenderText,
    getAdditionalOffset,
    measureTextWidth,
    getFontLineMetrics,
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
    isCursorInSkewedLabel,
    isCursorOverChartLabel,
    getNiceUpperBound,
    getNiceLowerBound,
    getYAxisLabelWidth,
};

export type {ChartLabelHitTestParams};
