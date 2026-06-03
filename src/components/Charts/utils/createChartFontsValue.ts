import type {SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import type {ChartFontsValue} from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';

function createChartFontsValue(typefaces: ChartDefaultTypeface, fontManagerFamilies: Record<string, SkTypeface[]>): ChartFontsValue {
    const fontMgr = Skia.TypefaceFontProvider.Make();

    for (const [familyName, familyTypefaces] of Object.entries(fontManagerFamilies)) {
        for (const typeface of familyTypefaces) {
            fontMgr.registerFont(typeface, familyName);
        }
    }

    return {typefaces, fontMgr};
}

export default createChartFontsValue;
