import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

// eslint-disable-next-line no-restricted-imports
import singleFontFamily from '@styles/utils/FontUtils/fontFamily/singleFontFamily';

import type {SkTypeface} from '@shopify/react-native-skia';
import type {TextStyle} from 'react-native';

import type {ChartLabelFontWeight} from './normalizeChartFontWeight';

import CHART_TYPEFACE_SAME_FAMILY_FALLBACKS, {CHART_TYPEFACE_GLYPH_FALLBACKS} from './chartTypefaceFallbacks';
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

// Skip ASCII control characters (e.g. the `\n` line separators callers split on) that have no glyph.
const FIRST_PRINTABLE_CODE_POINT = 0x20;

function typefaceCanRenderText(typeface: SkTypeface, text: string): boolean {
    for (const char of text) {
        const codePoint = char.codePointAt(0);

        if (codePoint === undefined || codePoint < FIRST_PRINTABLE_CODE_POINT) {
            continue;
        }

        if (typeface.getGlyphIDs(char).every((glyphID) => glyphID === 0)) {
            return false;
        }
    }

    return true;
}

/**
 * Some brand fonts (e.g. Expensify New Kansas) only cover Latin script and don't include rarer
 * currency symbols (e.g. the Vietnamese dong sign). Unlike CSS, Skia's `Font`/`SkText` draw with a
 * single typeface and never fall back to another font for a glyph it's missing, so an unsupported
 * character renders incorrectly.
 */
function getGlyphFallbackKey(typefaceKey: ChartSkiaTypefaceKey): ChartSkiaTypefaceKey {
    return CHART_TYPEFACE_GLYPH_FALLBACKS[typefaceKey] ?? 'EXP_NEUE';
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
    /** When provided, swaps to a typeface with broader glyph coverage if the resolved one can't render this text. */
    text?: string,
): SkTypeface | null {
    const typefaceKey = getChartSkiaTypefaceKey(fontFamily, normalizeFontStyle(fontStyle), normalizeChartFontWeight(fontWeight));
    const resolvedTypeface = resolveTypefaceWithFallbacks(typefaces, typefaceKey);

    if (resolvedTypeface && text && !typefaceCanRenderText(resolvedTypeface, text)) {
        const fallbackTypeface = resolveTypefaceWithFallbacks(typefaces, getGlyphFallbackKey(typefaceKey));

        if (fallbackTypeface) {
            return fallbackTypeface;
        }
    }

    return resolvedTypeface;
}

export default getChartSkiaTypeface;
