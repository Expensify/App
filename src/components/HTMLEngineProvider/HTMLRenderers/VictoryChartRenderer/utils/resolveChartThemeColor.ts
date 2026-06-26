import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

import type {Color} from '@shopify/react-native-skia';
import type {ColorValue} from 'react-native';

/**
 * Only the chart background colors are remapped. Data-visualization colors (series /
 * slice fills, legend symbols) are intentionally excluded so they remain
 * consistent across themes.
 */
type ChartThemeColorKey = 'cardBG' | 'heading' | 'textSupporting' | 'border';

const CHART_CHROME_COLOR_MAP = new Map<string, ChartThemeColorKey>(
    (
        [
            [colors.productLight200, 'cardBG'],
            [colors.productLight900, 'heading'],
            [colors.productLight800, 'textSupporting'],
            [colors.productLight400, 'border'],
        ] as const
    ).map(([hex, key]) => [hex.toLowerCase(), key]),
);

function resolveChartThemeColor(color: string | undefined, theme: ThemeColors): string | undefined;
function resolveChartThemeColor(color: Color | undefined, theme: ThemeColors): Color | undefined;
function resolveChartThemeColor(color: Color | undefined, theme: ThemeColors): Color | undefined {
    if (typeof color !== 'string') {
        return color;
    }
    const themeKey = CHART_CHROME_COLOR_MAP.get(color.toLowerCase());
    return themeKey ? theme[themeKey] : color;
}

/**
 * Resolves a `ViewStyle.backgroundColor` (ColorValue) through the chart theme
 * color map. Non-string color values pass through unchanged.
 */
function resolveChartContainerBgColor(bgColor: ColorValue | undefined, theme: ThemeColors): ColorValue | undefined {
    return typeof bgColor === 'string' ? (resolveChartThemeColor(bgColor, theme) ?? bgColor) : bgColor;
}

export default resolveChartThemeColor;
export {resolveChartContainerBgColor};
