import type {SkTypeface} from '@shopify/react-native-skia';
import type {TextStyle} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import singleFontFamily from '@styles/utils/FontUtils/fontFamily/singleFontFamily';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from './chartSkiaTypefaceTypes';

type ChartLabelFontStyle = 'normal' | 'italic';
type ChartLabelFontWeight = 'normal' | 'bold';

function normalizeFontStyle(fontStyle: string | undefined): ChartLabelFontStyle {
    return fontStyle === 'italic' ? 'italic' : 'normal';
}

function normalizeFontWeight(fontWeight: string | number | undefined): ChartLabelFontWeight {
    return Number(fontWeight) === 700 ? 'bold' : 'normal';
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

    if (resolvedFontFamily === singleFontFamily.EXP_NEW_KANSAS_MEDIUM.fontFamily) {
        return fontStyle === 'italic' ? 'EXP_NEW_KANSAS_MEDIUM_ITALIC' : 'EXP_NEW_KANSAS_MEDIUM';
    }

    const matchingEntry = (Object.entries(singleFontFamily) as Array<[ChartSkiaTypefaceKey, (typeof singleFontFamily)[ChartSkiaTypefaceKey]]>).find(
        ([, definition]) => definition.fontFamily === resolvedFontFamily && normalizeFontStyle(definition.fontStyle) === fontStyle && fontWeightMatches(definition.fontWeight, fontWeight),
    );

    return matchingEntry?.[0] ?? 'EXP_NEUE';
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
    const typefaceKey = getChartSkiaTypefaceKey(fontFamily, normalizeFontStyle(fontStyle), normalizeFontWeight(fontWeight));
    return typefaces[typefaceKey];
}

export {getChartSkiaTypeface};
