import type {SkTypeface} from '@shopify/react-native-skia';
import type {TextStyle} from 'react-native';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
// eslint-disable-next-line no-restricted-imports
import singleFontFamily from '@styles/utils/FontUtils/fontFamily/singleFontFamily';
import CHART_TYPEFACE_SAME_FAMILY_FALLBACKS from './chartTypefaceFallbacks';
import type {ChartLabelFontWeight} from './normalizeChartFontWeight';
import normalizeChartFontWeight from './normalizeChartFontWeight';

type ChartLabelFontStyle = 'normal' | 'italic';

function normalizeFontStyle(fontStyle: string | undefined): ChartLabelFontStyle {
    return fontStyle === 'italic' ? 'italic' : 'normal';
}

function fontWeightMatches(definitionWeight: TextStyle['fontWeight'], labelWeight: ChartLabelFontWeight): boolean {
    const numericWeight = Number(definitionWeight);

    if (labelWeight === 'bold') {
        return numericWeight >= 600 || definitionWeight === 'bold';
    }

    return numericWeight < 600 && definitionWeight !== 'bold';
}

function getChartSkiaTypefaceKey(fontFamily: string | undefined, fontStyle: ChartLabelFontStyle, fontWeight: ChartLabelFontWeight): ChartSkiaTypefaceKey {
    const resolvedFontFamily = fontFamily ?? singleFontFamily.EXP_NEUE.fontFamily;

    // Kansas has no bold variant; weight is ignored and Medium is always used.
    if (resolvedFontFamily === singleFontFamily.EXP_NEW_KANSAS_MEDIUM.fontFamily) {
        return fontStyle === 'italic' ? 'EXP_NEW_KANSAS_MEDIUM_ITALIC' : 'EXP_NEW_KANSAS_MEDIUM';
    }

    const matchingKey = (Object.keys(singleFontFamily) as Array<keyof typeof singleFontFamily>)
        .filter((key): key is ChartSkiaTypefaceKey => key !== 'SYSTEM')
        .find((key) => {
            const definition = singleFontFamily[key];
            return definition.fontFamily === resolvedFontFamily && normalizeFontStyle(definition.fontStyle) === fontStyle && fontWeightMatches(definition.fontWeight, fontWeight);
        });

    return matchingKey ?? 'EXP_NEUE';
}

function getFirstAvailableTypeface(typefaces: ChartDefaultTypeface): SkTypeface | null {
    for (const typeface of Object.values(typefaces)) {
        if (typeface) {
            return typeface;
        }
    }

    return null;
}

function resolveTypefaceWithFallbacks(typefaces: ChartDefaultTypeface, typefaceKey: ChartSkiaTypefaceKey): SkTypeface | null {
    const primaryTypeface = typefaces[typefaceKey];

    if (primaryTypeface) {
        return primaryTypeface;
    }

    const sameFamilyFallbacks = CHART_TYPEFACE_SAME_FAMILY_FALLBACKS[typefaceKey] ?? [];

    for (const fallbackKey of sameFamilyFallbacks) {
        const fallbackTypeface = typefaces[fallbackKey];

        if (fallbackTypeface) {
            return fallbackTypeface;
        }
    }

    if (typefaceKey !== 'EXP_NEUE') {
        const expNeueTypeface = typefaces.EXP_NEUE;

        if (expNeueTypeface) {
            return expNeueTypeface;
        }
    }

    return getFirstAvailableTypeface(typefaces);
}

function getChartSkiaTypeface(
    typefaces: ChartDefaultTypeface,
    {
        fontFamily,
        fontStyle,
        fontWeight,
    }: {
        fontFamily?: string;
        fontStyle?: string;
        fontWeight?: string | number;
    },
): SkTypeface | null {
    const typefaceKey = getChartSkiaTypefaceKey(fontFamily, normalizeFontStyle(fontStyle), normalizeChartFontWeight(fontWeight));
    return resolveTypefaceWithFallbacks(typefaces, typefaceKey);
}

export default getChartSkiaTypeface;
