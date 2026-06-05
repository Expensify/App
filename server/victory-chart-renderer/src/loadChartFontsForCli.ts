import {Skia} from '@shopify/react-native-skia';
import type {SkTypeface} from '@shopify/react-native-skia';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import buildSkiaFontManager from '@components/Charts/utils/buildSkiaFontManager';
import {CHART_FONT_MGR_SUPPLEMENTAL_PATHS, CHART_SKIA_TYPEFACE_PATHS} from './chartFontPathsForCli';

async function loadTypefaceFromFile(path: string): Promise<SkTypeface | null> {
    const bytes = await Bun.file(path).bytes();
    return Skia.Typeface.MakeFreeTypeFaceFromData(Skia.Data.fromBytes(bytes));
}

async function loadChartFontsForCli(): Promise<ChartFontsValue> {
    const typefaceKeys = Object.keys(CHART_SKIA_TYPEFACE_PATHS) as ChartSkiaTypefaceKey[];
    const typefaceEntries = await Promise.all(
        typefaceKeys.map(async (typefaceKey) => {
            const typeface = await loadTypefaceFromFile(CHART_SKIA_TYPEFACE_PATHS[typefaceKey]);
            return [typefaceKey, typeface] as const;
        }),
    );

    const typefaces = Object.fromEntries(typefaceEntries) as ChartDefaultTypeface;
    const fontMgr = buildSkiaFontManager(typefaces);

    await Promise.all(
        Object.entries(CHART_FONT_MGR_SUPPLEMENTAL_PATHS).map(async ([familyName, path]) => {
            const typeface = await loadTypefaceFromFile(path);

            if (typeface) {
                fontMgr.registerFont(typeface, familyName);
            }
        }),
    );

    return {typefaces, fontMgr};
}

export default loadChartFontsForCli;
