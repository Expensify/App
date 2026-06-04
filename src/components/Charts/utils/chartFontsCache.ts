import type {DataModule, SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import {Image} from 'react-native';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import Log from '@libs/Log';
import {CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, CHART_SKIA_TYPEFACE_ASSETS} from './chartFontAssets';
import {CHART_FONT_MGR_FROM_TYPEFACES} from './chartFontConstants';

const EMPTY_CHART_FONTS: ChartFontsValue = {
    typefaces: Object.fromEntries((Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[]).map((key) => [key, null])) as ChartDefaultTypeface,
    fontMgr: null,
};

let cachedChartFonts: ChartFontsValue | null = null;
let loadPromise: Promise<ChartFontsValue> | null = null;
const chartFontLoadListeners = new Set<() => void>();

function resolveChartFontAsset(source: DataModule | string): string {
    if (typeof source === 'string') {
        return source;
    }

    if (typeof source === 'number') {
        return Image.resolveAssetSource(source).uri;
    }

    if ('default' in source && typeof source.default === 'string') {
        return source.default;
    }

    if ('uri' in source && typeof source.uri === 'string') {
        return source.uri;
    }

    throw new Error('Unsupported chart font asset source');
}

function loadTypefaceFromAsset(source: DataModule | string): Promise<SkTypeface | null> {
    const uri = resolveChartFontAsset(source);

    return Skia.Data.fromURI(uri).then((data) => Skia.Typeface.MakeFreeTypeFaceFromData(data));
}

function loadChartSkiaTypefaces(): Promise<ChartDefaultTypeface> {
    const typefaceKeys = Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[];

    return Promise.all(
        typefaceKeys.map(async (typefaceKey) => {
            const typeface = await loadTypefaceFromAsset(CHART_SKIA_TYPEFACE_ASSETS[typefaceKey]);
            return [typefaceKey, typeface] as const;
        }),
    ).then((entries) => Object.fromEntries(entries) as ChartDefaultTypeface);
}

function buildChartFontsValue(typefaces: ChartDefaultTypeface): Promise<ChartFontsValue> {
    const fontMgr = Skia.TypefaceFontProvider.Make();

    for (const [familyName, typefaceKeys] of Object.entries(CHART_FONT_MGR_FROM_TYPEFACES)) {
        for (const typefaceKey of typefaceKeys) {
            const typeface = typefaces[typefaceKey];

            if (typeface) {
                fontMgr.registerFont(typeface, familyName);
            }
        }
    }

    return Promise.all(
        Object.entries(CHART_FONT_MGR_SUPPLEMENTAL_ASSETS).map(async ([familyName, asset]) => {
            const typeface = await loadTypefaceFromAsset(asset);

            if (typeface) {
                fontMgr.registerFont(typeface, familyName);
            }
        }),
    ).then(() => ({typefaces, fontMgr}));
}

function loadChartFonts(): Promise<ChartFontsValue> {
    return loadChartSkiaTypefaces().then(buildChartFontsValue);
}

function subscribeToChartFonts(listener: () => void): () => void {
    chartFontLoadListeners.add(listener);

    return () => {
        chartFontLoadListeners.delete(listener);
    };
}

function getChartFontsSnapshot(): ChartFontsValue {
    return cachedChartFonts ?? EMPTY_CHART_FONTS;
}

function notifyChartFontLoadListeners(): void {
    for (const listener of chartFontLoadListeners) {
        listener();
    }
}

function loadChartFontsOnce(): Promise<ChartFontsValue> {
    if (cachedChartFonts) {
        return Promise.resolve(cachedChartFonts);
    }

    if (!loadPromise) {
        loadPromise = loadChartFonts()
            .then((fonts) => {
                cachedChartFonts = fonts;
                notifyChartFontLoadListeners();
                return fonts;
            })
            .catch((error: unknown) => {
                Log.hmmm('Chart fonts failed to load', {
                    error: error instanceof Error ? error.message : String(error),
                });
                loadPromise = null;
                notifyChartFontLoadListeners();
                return EMPTY_CHART_FONTS;
            });
    }

    return loadPromise;
}

export {getChartFontsSnapshot, loadChartFontsOnce, subscribeToChartFonts};
