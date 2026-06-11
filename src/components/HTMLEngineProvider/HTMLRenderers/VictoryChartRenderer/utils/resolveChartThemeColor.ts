import type {Color} from '@shopify/react-native-skia';
import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

/**
 * Maps hardcoded light-mode hex colors (from server-generated chart HTML) to
 * semantic theme keys so charts adapt to the active theme (light / dark).
 *
 * Only UI-chrome colors are remapped. Data-visualization colors (series /
 * slice fills, legend symbols) are intentionally excluded so they remain
 * consistent across themes.
 */
type ChartThemeColorKey = 'cardBG' | 'heading' | 'textSupporting' | 'border';

const CHART_CHROME_COLOR_MAP = new Map<string, ChartThemeColorKey>(
    (
        [
            ['#f7f2ef', 'cardBG'],
            [colors.productLight200, 'cardBG'],
            [colors.productLight900, 'heading'],
            ['#73857e', 'textSupporting'],
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

export default resolveChartThemeColor;
