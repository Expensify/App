import type {Color} from '@shopify/react-native-skia';
import type {ColorValue} from 'react-native';
import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

/**
 * Only UI-chrome colors are remapped. Data-visualization colors (series /
 * slice fills, legend symbols) are intentionally excluded so they remain
 * consistent across themes.
 */
type ChartThemeColorKey = 'cardBG' | 'heading' | 'textSupporting' | 'border';

/** Server-generated chart HTML may emit these legacy hex values instead of the current design-system tokens. */
const SERVER_CARD_BG_LEGACY = '#f7f2ef';
const SERVER_TEXT_SUPPORTING_LEGACY = '#73857e';

const CHART_CHROME_COLOR_MAP = new Map<string, ChartThemeColorKey>(
    (
        [
            [SERVER_CARD_BG_LEGACY, 'cardBG'],
            [colors.productLight200, 'cardBG'],
            [colors.productLight900, 'heading'],
            [SERVER_TEXT_SUPPORTING_LEGACY, 'textSupporting'],
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
