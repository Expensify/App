import {useMemo} from 'react';
import colors from '@styles/theme/colors';

/**
 * Hook to generate the Expensify Chart Color Palette.
 * Sequence logic:
 * 1. Row Sequence: 400, 600, 300, 500, 700
 * 2. Hue Order: Yellow, Tangerine, Pink, Green, Ice, Blue
 */
const useChartColors = () => {
    const chartPalette = useMemo(() => {
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
    }, []);

    /**
     * Gets a color from the sequence based on index.
     * Automatically loops back to the start if the index exceeds 29.
     */
    const getChartColor = (index: number): string | undefined => {
        if (chartPalette.length === 0) {
            return colors.black; // Fallback
        }
        return chartPalette.at(index % chartPalette.length);
    };

    return {
        chartPalette,
        getChartColor,
    };
};

export default useChartColors;
