import type {SkFont} from '@shopify/react-native-skia';
import colors from '@styles/theme/colors';

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

export {getChartColor, DEFAULT_CHART_COLOR, measureTextWidth, rotatedLabelCenterCorrection, rotatedLabelYOffset, calculateMinDomainPadding};
