import colors from '@styles/theme/colors';

/**
 * Expensify Chart Color Palette.
 * Sequence logic:
 * 1. Row Sequence: 400, 600, 300, 500, 700
 * 2. Hue Order: Yellow, Tangerine, Pink, Green, Ice, Blue
 */
const CHART_PALETTE: string[] = (() => {
    const rows = [400, 600, 300, 500, 700] as const;
    const hues = ['yellow', 'tangerine', 'pink', 'green', 'ice', 'blue'] as const;

    const palette: string[] = [];

    // Generate the 30 unique combinations (5 rows × 6 hues)
    for (const row of rows) {
        for (const hue of hues) {
            const colorKey = `${hue}${row}`;
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
const DEFAULT_CHART_COLOR = getChartColor(4);

export {getChartColor, DEFAULT_CHART_COLOR};
