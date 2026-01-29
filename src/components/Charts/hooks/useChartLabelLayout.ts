import type {SkFont} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import {
    LABEL_ELLIPSIS,
    LABEL_PADDING,
    SIN_45_DEGREES,
    X_AXIS_LABEL_MAX_HEIGHT_RATIO,
    X_AXIS_LABEL_ROTATION_45,
    X_AXIS_LABEL_ROTATION_90,
    Y_AXIS_LABEL_OFFSET,
} from '@components/Charts/constants';

type ChartDataPoint = {
    label: string;
    [key: string]: unknown;
};

type LabelLayoutConfig = {
    data: ChartDataPoint[];
    font: SkFont | null;
    chartWidth: number;
    containerHeight: number;
};

/**
 * Measure the width of a text string using the font's glyph widths.
 * Uses getGlyphWidths as measureText is not implemented on React Native Web.
 */
function measureTextWidth(text: string, font: SkFont): number {
    const glyphIDs = font.getGlyphIDs(text);
    const glyphWidths = font.getGlyphWidths(glyphIDs);
    return glyphWidths.reduce((sum, w) => sum + w, 0);
}

function useChartLabelLayout({data, font, chartWidth, containerHeight}: LabelLayoutConfig) {
    return useMemo(() => {
        if (!font || chartWidth === 0 || containerHeight === 0 || data.length === 0) {
            return {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: data.map((p) => p.label)};
        }

        // Get font metrics
        const fontMetrics = font.getMetrics();
        const lineHeight = Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.ascent);
        const ellipsisWidth = measureTextWidth(LABEL_ELLIPSIS, font);

        // Calculate available dimensions
        const availableWidthPerBar = chartWidth / data.length - LABEL_PADDING;

        // Measure original labels
        const labelWidths = data.map((p) => measureTextWidth(p.label, font));
        const maxLabelLength = Math.max(...labelWidths);

        // Helper to truncate a label to fit a max pixel width
        const truncateToWidth = (label: string, labelWidth: number, maxWidth: number): string => {
            if (labelWidth <= maxWidth) {
                return label;
            }
            const availableWidth = maxWidth - ellipsisWidth;
            if (availableWidth <= 0) {
                return LABEL_ELLIPSIS;
            }
            const ratio = availableWidth / labelWidth;
            const maxChars = Math.max(1, Math.floor(label.length * ratio));
            return label.slice(0, maxChars) + LABEL_ELLIPSIS;
        };

        // === DETERMINE ROTATION (based on WIDTH constraint, monotonic: 0° → 45° → 90°) ===
        let rotation = 0;
        if (maxLabelLength > availableWidthPerBar) {
            // Labels don't fit at 0°, try 45°
            const effectiveWidthAt45 = maxLabelLength * SIN_45_DEGREES;
            if (effectiveWidthAt45 <= availableWidthPerBar) {
                rotation = 45;
            } else {
                // 45° doesn't fit either, use 90°
                rotation = 90;
            }
        }

        // === DETERMINE TRUNCATION ===
        // Limit label area to X_AXIS_LABEL_MAX_HEIGHT_RATIO of container height.
        //
        // IMPLEMENTATION NOTE: We assume Victory allocates space for X-axis labels using:
        //   totalHeight = fontHeight + yAxis.labelOffset * 2 + labelWidth * sin(angle)
        // This formula was found in: victory-native-xl/src/cartesian/utils/transformInputData.ts
        // If Victory changes this formula, these calculations will need adjustment.
        //
        // We calculate max labelWidth so total allocation stays within our limit.
        const maxLabelHeight = containerHeight * X_AXIS_LABEL_MAX_HEIGHT_RATIO;
        const victoryBaseAllocation = lineHeight + Y_AXIS_LABEL_OFFSET * 2;
        const availableForRotation = Math.max(0, maxLabelHeight - victoryBaseAllocation);

        let maxAllowedLabelWidth: number;

        if (rotation === 0) {
            // At 0°: no truncation, use skip interval instead (like Google Sheets)
            maxAllowedLabelWidth = Infinity;
        } else if (rotation === 45) {
            // At 45°: labelWidth * sin(45°) <= availableForRotation
            // labelWidth <= availableForRotation / sin(45°)
            maxAllowedLabelWidth = availableForRotation / SIN_45_DEGREES;
        } else {
            // At 90°: no truncation, container expands to accommodate labels
            maxAllowedLabelWidth = Infinity;
        }

        // Generate truncated labels
        const finalLabels = data.map((p, i) => truncateToWidth(p.label, labelWidths.at(i) ?? 0, maxAllowedLabelWidth));

        // === CALCULATE SKIP INTERVAL ===
        // Calculate effective width based on rotation angle
        const finalMaxWidth = Math.max(...finalLabels.map((l) => measureTextWidth(l, font)));
        let effectiveWidth: number;
        if (rotation === 0) {
            effectiveWidth = finalMaxWidth;
        } else if (rotation === 45) {
            effectiveWidth = finalMaxWidth * SIN_45_DEGREES;
        } else {
            effectiveWidth = lineHeight; // At 90°, width is the line height
        }

        // Calculate skip interval using spec formula:
        // maxVisibleLabels = floor(chartWidth / (effectiveWidth + MIN_LABEL_GAP))
        // skipInterval = ceil(barCount / maxVisibleLabels)
        let skipInterval = 1;
        const maxVisibleLabels = Math.floor(chartWidth / (effectiveWidth + LABEL_PADDING));
        if (maxVisibleLabels > 0 && maxVisibleLabels < data.length) {
            skipInterval = Math.ceil(data.length / maxVisibleLabels);
        }

        // Convert rotation to negative degrees for Victory chart
        let rotationValue = 0;
        if (rotation === 45) {
            rotationValue = X_AXIS_LABEL_ROTATION_45;
        } else if (rotation === 90) {
            rotationValue = X_AXIS_LABEL_ROTATION_90;
        }

        return {labelRotation: rotationValue, labelSkipInterval: skipInterval, truncatedLabels: finalLabels, maxLabelLength};
    }, [font, chartWidth, containerHeight, data]);
}

export {useChartLabelLayout};
export type {LabelLayoutConfig};
