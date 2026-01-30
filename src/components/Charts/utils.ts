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

export {getChartColor, DEFAULT_CHART_COLOR};
