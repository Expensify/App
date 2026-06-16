import type {DataModule, SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import {Image} from 'react-native';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import Log from '@libs/Log';
import buildSkiaFontManager from './buildSkiaFontManager';
import {CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, CHART_SKIA_TYPEFACE_ASSETS} from './chartFontAssets';

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

function logChartFontLoadError(assetKey: string, error: unknown): void {
    Log.hmmm('Chart font asset failed to load', {
        assetKey,
        error: error instanceof Error ? error.message : String(error),
    });
}

async function loadTypefaceFromAssetSafely(assetKey: string, source: DataModule | string): Promise<SkTypeface | null> {
    try {
        return await loadTypefaceFromAsset(source);
    } catch (error: unknown) {
        logChartFontLoadError(assetKey, error);
        return null;
    }
}

async function loadChartSkiaTypefaces(): Promise<ChartDefaultTypeface> {
    const typefaceKeys = Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[];
    const results = await Promise.allSettled(
        typefaceKeys.map(async (typefaceKey) => {
            const typeface = await loadTypefaceFromAssetSafely(typefaceKey, CHART_SKIA_TYPEFACE_ASSETS[typefaceKey]);
            return [typefaceKey, typeface] as const;
        }),
    );

    const entries = results.map((result, index) => {
        const typefaceKey = typefaceKeys[index];

        if (result.status === 'fulfilled') {
            return result.value;
        }

        logChartFontLoadError(typefaceKey, result.reason);
        return [typefaceKey, null] as const;
    });

    return Object.fromEntries(entries) as ChartDefaultTypeface;
}

function hasAnyLoadedTypeface(typefaces: ChartDefaultTypeface): boolean {
    return Object.values(typefaces).some((typeface) => typeface !== null);
}

async function buildChartFontsValue(typefaces: ChartDefaultTypeface): Promise<ChartFontsValue> {
    if (!hasAnyLoadedTypeface(typefaces)) {
        return EMPTY_CHART_FONTS;
    }

    const fontMgr = buildSkiaFontManager(typefaces);
    const supplementalResults = await Promise.allSettled(
        Object.entries(CHART_FONT_MGR_SUPPLEMENTAL_ASSETS).map(async ([familyName, asset]) => {
            const typeface = await loadTypefaceFromAssetSafely(familyName, asset);

            if (typeface) {
                fontMgr.registerFont(typeface, familyName);
            }
        }),
    );

    for (const result of supplementalResults) {
        if (result.status === 'rejected') {
            logChartFontLoadError('supplemental', result.reason);
        }
    }

    return {typefaces, fontMgr};
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

/* istanbul ignore next */
function resetChartFontsCacheForTests(): void {
    cachedChartFonts = null;
    loadPromise = null;
}

export {getChartFontsSnapshot, loadChartFontsOnce, resetChartFontsCacheForTests, subscribeToChartFonts};
