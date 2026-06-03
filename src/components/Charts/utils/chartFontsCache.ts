import type {DataModule, SkTypeface} from '@shopify/react-native-skia';
import {Skia} from '@shopify/react-native-skia';
import {Image} from 'react-native';
import type {ChartFontsValue} from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_FONT_MANAGER_FAMILIES, CHART_SKIA_TYPEFACE_ASSETS} from './chartFontAssets';
import createChartFontsValue from './createChartFontsValue';

const EMPTY_CHART_FONTS: ChartFontsValue = {
    typefaces: {
        MONOSPACE: null,
        MONOSPACE_BOLD: null,
        MONOSPACE_ITALIC: null,
        MONOSPACE_BOLD_ITALIC: null,
        EXP_NEUE: null,
        EXP_NEUE_BOLD: null,
        EXP_NEUE_ITALIC: null,
        EXP_NEUE_BOLD_ITALIC: null,
        EXP_NEW_KANSAS_MEDIUM: null,
        EXP_NEW_KANSAS_MEDIUM_ITALIC: null,
        CUSTOM_EMOJI_FONT: null,
    },
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

function loadFontManagerFamilies(): Promise<Record<string, SkTypeface[]>> {
    return Promise.all(
        Object.entries(CHART_FONT_MANAGER_FAMILIES).map(async ([familyName, familyAssets]) => {
            const familyTypefaces = await Promise.all(familyAssets.map((asset) => loadTypefaceFromAsset(asset)));

            return [familyName, familyTypefaces.filter((typeface): typeface is SkTypeface => typeface !== null)] as const;
        }),
    ).then((entries) => Object.fromEntries(entries));
}

function loadChartFonts(): Promise<ChartFontsValue> {
    return Promise.all([loadChartSkiaTypefaces(), loadFontManagerFamilies()]).then(([typefaces, fontManagerFamilies]) => createChartFontsValue(typefaces, fontManagerFamilies));
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
            .catch((error) => {
                loadPromise = null;
                throw error;
            });
    }

    return loadPromise;
}

export {getChartFontsSnapshot, loadChartFontsOnce, subscribeToChartFonts};
