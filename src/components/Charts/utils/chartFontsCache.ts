import type {DataModule, SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import {Image} from 'react-native';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import Log from '@libs/Log';
import buildSkiaFontManager from './buildSkiaFontManager';
import {CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, CHART_SKIA_TYPEFACE_ASSETS} from './chartFontAssets';
import hasAnyLoadedChartTypeface from './hasAnyLoadedChartTypeface';
import loadChartTypefacesFromAssets from './loadChartTypefacesFromAssets';
import logChartFontLoadError from './logChartFontLoadError';

const EMPTY_CHART_FONTS: ChartFontsValue = {
    typefaces: Object.fromEntries((Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[]).map((key) => [key, null])) as ChartDefaultTypeface,
    fontManager: null,
};

let cachedChartFonts: ChartFontsValue | null = null;
let loadPromise: Promise<ChartFontsValue> | null = null;
const chartFontLoadListeners = new Set<() => void>();

function resolveChartFontAsset(source: DataModule | string): string {
    if (typeof source === 'string') {
        return source;
    }

    if (typeof source === 'number') {
        const resolved = Image.resolveAssetSource(source);

        if (!resolved?.uri) {
            throw new Error('Chart font asset could not be resolved');
        }

        return resolved.uri;
    }

    if ('default' in source && typeof source.default === 'string') {
        return source.default;
    }

    if ('uri' in source && typeof source.uri === 'string') {
        return source.uri;
    }

    throw new Error('Unsupported chart font asset source');
}

async function loadTypefaceFromAsset(source: DataModule | string): Promise<SkTypeface | null> {
    const uri = resolveChartFontAsset(source);
    const data = await Skia.Data.fromURI(uri);

    return Skia.Typeface.MakeFreeTypeFaceFromData(data);
}

async function loadChartSkiaTypefaces(): Promise<ChartDefaultTypeface> {
    return loadChartTypefacesFromAssets(CHART_SKIA_TYPEFACE_ASSETS, async (source) => loadTypefaceFromAsset(source), logChartFontLoadError);
}

async function buildChartFontsValue(typefaces: ChartDefaultTypeface): Promise<ChartFontsValue> {
    if (!hasAnyLoadedChartTypeface(typefaces)) {
        return EMPTY_CHART_FONTS;
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
                if (!hasAnyLoadedChartTypeface(fonts.typefaces)) {
                    loadPromise = null;
                    notifyChartFontLoadListeners();
                    return EMPTY_CHART_FONTS;
                }

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

function resetChartFontsCacheForTests(): void {
    cachedChartFonts = null;
    loadPromise = null;
}

export {getChartFontsSnapshot, loadChartFontsOnce, resetChartFontsCacheForTests, subscribeToChartFonts};
