import type {SkTypeface} from '@shopify/react-native-skia';
import type {ChartLabelFontStyle, ChartTypefaces} from '@components/Charts/types';

/**
 * Normalizes Victory/HTML font family names to Skia-registered family keys.
 */
function normalizeChartFontFamily(fontFamily?: string): 'ExpensifyNeue' | 'ExpensifyNewKansas' | undefined {
    if (!fontFamily) {
        return undefined;
    }

    const normalized = fontFamily.replace(/\s+/g, '').toLowerCase();

    if (normalized === 'expensifynewkansas') {
        return 'ExpensifyNewKansas';
    }

    if (normalized === 'expensifyneue') {
        return 'ExpensifyNeue';
    }

    return undefined;
}

/**
 * Resolves the Skia typeface for a chart label style.
 */
function getChartLabelTypeface(typefaces: ChartTypefaces, style?: ChartLabelFontStyle): SkTypeface | null {
    const fontFamily = normalizeChartFontFamily(style?.fontFamily);
    const isBold = Number(style?.fontWeight) === 700;
    const isItalic = style?.fontStyle === 'italic';

    if (fontFamily === 'ExpensifyNewKansas') {
        if (isItalic) {
            return typefaces.newKansasItalic ?? typefaces.newKansas ?? typefaces.regular;
        }

        return typefaces.newKansas ?? typefaces.regular;
    }

    if (isBold) {
        return typefaces.bold ?? typefaces.regular;
    }

    return typefaces.regular;
}

export {getChartLabelTypeface, normalizeChartFontFamily};
