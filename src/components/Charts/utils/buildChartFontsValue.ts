import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_FONT_MGR_FROM_TYPEFACES} from './chartFontConstants';

function buildChartFontsValueFromTypefaces(typefaces: ChartDefaultTypeface): ChartFontsValue {
    const fontMgr: SkTypefaceFontProvider = Skia.TypefaceFontProvider.Make();

    for (const [familyName, typefaceKeys] of Object.entries(CHART_FONT_MGR_FROM_TYPEFACES)) {
        for (const typefaceKey of typefaceKeys) {
            const typeface = typefaces[typefaceKey];

            if (typeface) {
                fontMgr.registerFont(typeface, familyName);
            }
        }
    }

    return {typefaces, fontMgr};
}

export default buildChartFontsValueFromTypefaces;
