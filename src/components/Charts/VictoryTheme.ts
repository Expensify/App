/**
 * Centralized styles and layout constants for the chart components.
 */
import colors from '@styles/theme/colors';
import {CHART_FONT_FAMILY_NAMES} from './utils/chartFontConstants';

/** Shade groups in the palette */
const CHART_PALETTE_SHADES = [400, 600, 300, 500, 700] as const;

/** Hues cycling within each shade group */
const CHART_PALETTE_HUES = ['yellow', 'tangerine', 'pink', 'green', 'ice', 'blue'] as const;

/**
 * Expensify Chart Color Palette.
 *
 * Shades are ordered (400, 600, 300, 500, 700) so that sequential colors have
 * maximum contrast, making adjacent chart segments easy to distinguish.
 *
 * Within each shade, hues cycle: Yellow, Tangerine, Pink, Green, Ice, Blue.
 */
const CHART_PALETTE: string[] = (() => {
    const palette: string[] = [];

    // Generate the 30 unique combinations (5 shades × 6 hues)
    for (const shade of CHART_PALETTE_SHADES) {
        for (const hue of CHART_PALETTE_HUES) {
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

/** Index of the default single-color chart color (green400). */
const DEFAULT_CHART_COLOR_INDEX = 3;

/** Index of the default dot color (green500) */
const DEFAULT_CHART_DOT_COLOR_INDEX = DEFAULT_CHART_COLOR_INDEX + CHART_PALETTE_HUES.length * 3;

const VictoryTheme = {
    colors: {
        palette: CHART_PALETTE,
        /** Default color used for single-color charts (e.g., line chart, single-color bar chart) */
        default: getChartColor(DEFAULT_CHART_COLOR_INDEX),
        /** Default dot color for line chart data points, one shade darker than the line */
        defaultDot: getChartColor(DEFAULT_CHART_DOT_COLOR_INDEX),
        getColor: getChartColor,
    },
    fontFamilies: Array.from(CHART_FONT_FAMILY_NAMES),
    axis: {
        /** Number of Y-axis ticks (including zero) */
        tickCount: 5,
        /** Line width for X-axis (hidden) */
        xLineWidth: 0,
        /** Line width for Y-axis grid lines */
        yLineWidth: 1,
        /** Desired visual gap (px) between axis labels and the chart edge, used for both axes */
        labelGap: 12,
        /** Base chart padding applied to all sides */
        padding: {top: 5, left: 5, right: 5, bottom: 5},
    },
    tooltip: {
        /** The height of the chart tooltip pointer */
        pointerHeight: 4,
        /** The width of the chart tooltip pointer */
        pointerWidth: 12,
    },
    pie: {
        /** Starting angle for pie chart (0 = 3 o'clock, -90 = 12 o'clock) */
        startAngle: -90,
        /** Ratio of the inner radius to the outer radius, creating the donut hole (0 = full pie, 1 = no fill) */
        innerRadiusRatio: 0.8,
        /** Gap between pie slices in degrees */
        padAngle: 1,
    },
} as const;

/** Minimum height for the chart content area (bars, Y-axis, grid lines) */
const CHART_CONTENT_MIN_HEIGHT = 250;

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

/** Radian threshold separating diagonal from vertical label hit-test */
const DIAGONAL_ANGLE_RADIAN_THRESHOLD = 1;

// Maximum width for Y-axis labels in pixels
const MAX_Y_AXIS_LABEL_WIDTH = 200;

// Maximum width for X-axis labels in pixels
const MAX_X_AXIS_LABEL_WIDTH = 500;

// Small extra padding so complex glyphs (e.g. Arabic) are not clipped.
// getLongestLine() can slightly under-report the visual extent of the last glyph.
const GLYPH_PADDING = 4;

export {
    CHART_CONTENT_MIN_HEIGHT,
    LABEL_ROTATIONS,
    SIN_45,
    LABEL_PADDING,
    ELLIPSIS,
    MIN_TRUNCATED_CHARS,
    DIAGONAL_ANGLE_RADIAN_THRESHOLD,
    MAX_X_AXIS_LABEL_WIDTH,
    MAX_Y_AXIS_LABEL_WIDTH,
    GLYPH_PADDING,
};
export default VictoryTheme;
