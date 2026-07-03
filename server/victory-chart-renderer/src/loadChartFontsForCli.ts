import type {DataModule, SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import {dirname, isAbsolute, join} from 'node:path';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import buildSkiaFontManager from '@components/Charts/utils/buildSkiaFontManager';
import {CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import hasAnyLoadedChartTypeface from '@components/Charts/utils/hasAnyLoadedChartTypeface';
import loadChartTypefacesFromAssets from '@components/Charts/utils/loadChartTypefacesFromAssets';
import logChartFontLoadError from '@components/Charts/utils/logChartFontLoadError';

function resolveBundledAssetPath(source: DataModule | string): string {
    let assetPath: string | null = null;

    if (typeof source === 'string') {
        assetPath = source;
    } else if (typeof source === 'number') {
        throw new Error('Numeric chart font asset sources are not supported in the CLI');
    } else if ('default' in source && typeof source.default === 'string') {
        assetPath = source.default;
    }

    if (!assetPath) {
        throw new Error('Unsupported chart font asset source');
    }

    if (isAbsolute(assetPath)) {
        return assetPath;
    }

    return join(dirname(import.meta.path), assetPath);
}

async function loadTypefaceFromAsset(source: DataModule | string): Promise<SkTypeface | null> {
    const path = resolveBundledAssetPath(source);
    const bytes = await Bun.file(path).bytes();
    return Skia.Typeface.MakeFreeTypeFaceFromData(Skia.Data.fromBytes(bytes));
}

async function loadChartFontsForCli(): Promise<ChartFontsValue> {
    const typefaces = await loadChartTypefacesFromAssets(CHART_SKIA_TYPEFACE_ASSETS, async (asset) => loadTypefaceFromAsset(asset), logChartFontLoadError);

    if (!hasAnyLoadedChartTypeface(typefaces)) {
        return {typefaces, fontManager: null};
    }

    const fontManager = buildSkiaFontManager(typefaces);
    const supplementalTypefaces = await loadChartTypefacesFromAssets(CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, async (asset) => loadTypefaceFromAsset(asset), logChartFontLoadError);

    for (const [familyName, typeface] of Object.entries(supplementalTypefaces)) {
        if (typeface) {
            fontManager.registerFont(typeface, familyName);
        }
    }

    return {typefaces, fontManager};
}

export default loadChartFontsForCli;
