import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_FONT_MGR_FROM_TYPEFACES} from './chartFontConstants';

function buildSkiaFontManager(typefaces: ChartDefaultTypeface): SkTypefaceFontProvider {
    const fontManager = Skia.TypefaceFontProvider.Make();

    for (const [familyName, typefaceKeys] of Object.entries(CHART_FONT_MGR_FROM_TYPEFACES)) {
        for (const typefaceKey of typefaceKeys) {
            const typeface = typefaces[typefaceKey];

            if (typeface) {
                fontManager.registerFont(typeface, familyName);
            }
        }
    }

    return fontManager;
}

export default buildSkiaFontManager;
