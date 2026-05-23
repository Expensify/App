/**
 * Visual/theming values for the chart components: colors, font families, and configurable
 * style knobs (axis line widths, spacing, tooltip pointer dims, pie start angle).
 *
 * Things that depend on the design (could change with a redesign) belong here. Layout-math
 * constants (truncation thresholds, max measurement widths, ellipsis string, rotation enum,
 * glyph-clipping safety margin) live in `constants.ts`.
 */
import colors from '@styles/theme/colors';

/** Font families used by all chart label components (Paragraph API multi-font fallback). */
const CHART_FONT_FAMILIES = ['ExpensifyNeue', 'NotoSansSymbols', 'NotoSansSCMonths'];

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

    for (const shade of shades) {
        for (const hue of hues) {
            const colorKey = `${hue}${shade}`;
            // Defensive: every shade/hue combo exists in the theme palette today, but
            // skip silently if one is removed so chart rendering still works.
            if (colors[colorKey]) {
                palette.push(colors[colorKey]);
            }
        }
    }

    return palette;
})();

/**
 * Gets a color from the chart palette based on index.
 * Automatically loops back to the start if the index exceeds the palette length.
 */
function getChartColor(index: number): string {
    if (CHART_PALETTE.length === 0) {
        return colors.black;
    }
    return CHART_PALETTE.at(index % CHART_PALETTE.length) ?? colors.black;
}

const VictoryTheme = {
    colors: {
        /** Ordered palette used to assign colors to chart segments. */
        palette: CHART_PALETTE,
        /** Default color used for single-color charts (e.g., line chart, single-color bar chart). */
        default: getChartColor(5),
        /** Picks the palette color at `index`, wrapping around when needed. */
        getColor: getChartColor,
    },
    fontFamilies: CHART_FONT_FAMILIES,
    axis: {
        /** Number of Y-axis ticks (including zero). */
        tickCount: 5,
        /** Line width for X-axis (hidden). */
        xLineWidth: 0,
        /** Line width for Y-axis grid lines. */
        yLineWidth: 1,
        /** Desired visual gap (px) between axis labels and the chart edge, used for both axes. */
        labelGap: 12,
        /** Base chart padding applied to all sides. */
        padding: {top: 5, left: 5, right: 5, bottom: 5},
    },
    tooltip: {
        /** Fraction of the pie radius at which the tooltip anchor sits for each slice. */
        pieRadiusDistance: 2 / 3,
        /** Height (px) of the tooltip pointer (triangle). */
        pointerHeight: 4,
        /** Width (px) of the tooltip pointer (triangle). */
        pointerWidth: 12,
    },
    pie: {
        /** Starting angle for pie chart (0 = 3 o'clock, -90 = 12 o'clock). */
        startAngle: -90,
    },
} as const;

export default VictoryTheme;
