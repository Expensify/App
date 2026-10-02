import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import {getChartFontsSnapshot, loadChartFontsOnce, resetChartFontsCacheForTests, subscribeToChartFonts} from '@components/Charts/utils/chartFontsCache';

import type Log from '@libs/Log';

import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {DataModule, SkData, SkTypeface, SkTypefaceFontProvider, Skia} from '@shopify/react-native-skia';

import {Image} from 'react-native';

import createMock from '../utils/createMock';

const mockLogHmmm = jest.fn<ReturnType<typeof Log.hmmm>, Parameters<typeof Log.hmmm>>();
const mockFromURI = jest.fn<ReturnType<typeof Skia.Data.fromURI>, Parameters<typeof Skia.Data.fromURI>>();
const mockMakeFreeTypeFaceFromData = jest.fn<ReturnType<typeof Skia.Typeface.MakeFreeTypeFaceFromData>, Parameters<typeof Skia.Typeface.MakeFreeTypeFaceFromData>>();
const mockRegisterFont = jest.fn<ReturnType<SkTypefaceFontProvider['registerFont']>, Parameters<SkTypefaceFontProvider['registerFont']>>();
const mockFontProviderMake = jest.fn<ReturnType<typeof Skia.TypefaceFontProvider.Make>, Parameters<typeof Skia.TypefaceFontProvider.Make>>(() =>
    createMock<SkTypefaceFontProvider>({registerFont: mockRegisterFont}),
);
const mockResolveAssetSource = jest.fn<ReturnType<typeof Image.resolveAssetSource>, Parameters<typeof Image.resolveAssetSource>>();

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Data: {fromURI: (...args: Parameters<typeof Skia.Data.fromURI>) => mockFromURI(...args)},
        Typeface: {MakeFreeTypeFaceFromData: (...args: Parameters<typeof Skia.Typeface.MakeFreeTypeFaceFromData>) => mockMakeFreeTypeFaceFromData(...args)},
        TypefaceFontProvider: {Make: (...args: Parameters<typeof Skia.TypefaceFontProvider.Make>) => mockFontProviderMake(...args)},
    },
}));

jest.mock('@libs/Log', () => ({__esModule: true, default: {hmmm: (...args: Parameters<typeof Log.hmmm>) => mockLogHmmm(...args)}}));

jest.mock('@components/Charts/utils/chartFontAssets', () => {
    function makeAsset(name: string): DataModule {
        return {__esModule: true, default: `mock://font/${name}`};
    }
    const assets: Record<ChartSkiaTypefaceKey, DataModule | string> = {
        MONOSPACE: makeAsset('MONOSPACE'),
        MONOSPACE_BOLD: makeAsset('MONOSPACE_BOLD'),
        MONOSPACE_ITALIC: makeAsset('MONOSPACE_ITALIC'),
        MONOSPACE_BOLD_ITALIC: makeAsset('MONOSPACE_BOLD_ITALIC'),
        EXP_NEUE: makeAsset('EXP_NEUE'),
        EXP_NEUE_BOLD: makeAsset('EXP_NEUE_BOLD'),
        EXP_NEUE_ITALIC: makeAsset('EXP_NEUE_ITALIC'),
        EXP_NEUE_BOLD_ITALIC: makeAsset('EXP_NEUE_BOLD_ITALIC'),
        EXP_NEW_KANSAS_MEDIUM: makeAsset('EXP_NEW_KANSAS_MEDIUM'),
        EXP_NEW_KANSAS_MEDIUM_ITALIC: makeAsset('EXP_NEW_KANSAS_MEDIUM_ITALIC'),
        CUSTOM_EMOJI_FONT: makeAsset('CUSTOM_EMOJI_FONT'),
    };
    return {
        CHART_SKIA_TYPEFACE_ASSETS: assets,
        CHART_FONT_MGR_SUPPLEMENTAL_ASSETS: {NotoSansSymbols: makeAsset('NotoSansSymbols'), NotoSansSCMonths: makeAsset('NotoSansSCMonths')},
    };
});

const MOCK_CHART_FONT_ASSETS = jest.requireMock<{CHART_SKIA_TYPEFACE_ASSETS: Record<ChartSkiaTypefaceKey, DataModule | string>}>(
    '@components/Charts/utils/chartFontAssets',
).CHART_SKIA_TYPEFACE_ASSETS;
const ORIGINAL_CHART_FONT_ASSETS = {...MOCK_CHART_FONT_ASSETS};

function setupSuccessfulFontLoading(failingKey?: ChartSkiaTypefaceKey) {
    mockFromURI.mockImplementation((uri: string) => {
        const key = uri.replace('mock://font/', '');

        if (failingKey && key === failingKey) {
            return Promise.reject(new Error(`Failed to load ${key}`));
        }

        if (key === 'FAIL') {
            return Promise.reject(new Error('Failed to load font'));
        }

        const data = createMock<SkData>({});
        return Promise.resolve(data);
    });

    mockMakeFreeTypeFaceFromData.mockImplementation(() => createMock<SkTypeface>({}));
}

describe('chartFontsCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.assign(MOCK_CHART_FONT_ASSETS, ORIGINAL_CHART_FONT_ASSETS);
        mockResolveAssetSource.mockReset();
        jest.spyOn(Image, 'resolveAssetSource').mockImplementation((...args) => mockResolveAssetSource(...args));
        resetChartFontsCacheForTests();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should resolve with null for a failed typeface and populated values for the rest', async () => {
        // Given one font failure must not reject independent primary loads.
        setupSuccessfulFontLoading('EXP_NEUE_BOLD');

        // When the real cache loads the chart fonts.
        const fonts = await loadChartFontsOnce();

        // Then the failed key stays null while usable fonts still build a manager.
        expect(fonts.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(fonts.typefaces.EXP_NEUE).not.toBeNull();
        expect(fonts.fontManager).not.toBeNull();
    });

    it('should cache partial success so getChartFontsSnapshot returns loaded typefaces', async () => {
        // Given a usable partial result should remain available to subscribers.
        setupSuccessfulFontLoading('EXP_NEUE_BOLD');

        // When the real cache settles the load.
        await loadChartFontsOnce();

        const snapshot = getChartFontsSnapshot();
        // Then the snapshot retains both successful faces and the failed null key.
        expect(snapshot.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(snapshot.typefaces.EXP_NEUE).not.toBeNull();
        expect(snapshot.fontManager).not.toBeNull();
    });

    it('should return empty chart fonts when every asset fails to load', async () => {
        // Given no usable primary exists after all asset reads fail.
        mockFromURI.mockRejectedValue(new Error('Failed to load font'));
        mockMakeFreeTypeFaceFromData.mockReturnValue(null);

        // When the real cache loads the chart fonts.
        const fonts = await loadChartFontsOnce();

        // Then the result exposes the complete null map and no manager.
        expect(Object.values(fonts.typefaces).every((typeface) => typeface === null)).toBe(true);
        expect(fonts.fontManager).toBeNull();
    });

    it('should retry loading when every font-mgr typeface fails to load', async () => {
        // Given an unsuccessful attempt must permit another load.
        mockFromURI.mockRejectedValue(new Error('Failed to load font'));
        mockMakeFreeTypeFaceFromData.mockReturnValue(null);

        // When the real cache settles the load.
        await loadChartFontsOnce();
        // When the real cache settles the load.
        await loadChartFontsOnce();

        // Then both attempts read all eleven primary assets.
        expect(mockFromURI).toHaveBeenCalledTimes(22);
    });

    it('should not build fontManager when only the emoji font loads', async () => {
        // Given emoji alone cannot supply the font manager primary families.
        mockFromURI.mockImplementation((uri: string) => {
            const key = uri.replace('mock://font/', '');

            if (key === 'CUSTOM_EMOJI_FONT') {
                const data = createMock<SkData>({});
                return Promise.resolve(data);
            }

            return Promise.reject(new Error(`Failed to load ${key}`));
        });
        mockMakeFreeTypeFaceFromData.mockImplementation(() => createMock<SkTypeface>({}));

        // When the real cache loads the chart fonts.
        const fonts = await loadChartFontsOnce();

        // Then emoji-only success still returns the complete empty snapshot.
        expect(fonts.fontManager).toBeNull();
        expect(Object.values(fonts.typefaces).every((typeface) => typeface === null)).toBe(true);
    });

    it('shares an in-flight load and notifies subscribed listeners only after settlement', async () => {
        // Given primary loads cannot settle until released, and one listener unsubscribes.
        let releaseFontLoads: () => void = () => {};
        const fontLoadsReady = new Promise<void>((resolve) => {
            releaseFontLoads = resolve;
        });
        setupSuccessfulFontLoading();
        const successfulLoad = mockFromURI.getMockImplementation();
        expect(successfulLoad).toBeDefined();
        if (!successfulLoad) {
            throw new Error('Successful chart font loading must be configured');
        }
        mockFromURI.mockImplementation(async (uri) => {
            await fontLoadsReady;
            return successfulLoad(uri);
        });
        const empty = getChartFontsSnapshot();
        const listener = jest.fn<ReturnType<Parameters<typeof subscribeToChartFonts>[0]>, Parameters<Parameters<typeof subscribeToChartFonts>[0]>>(() => {
            expect(getChartFontsSnapshot()).not.toBe(empty);
            expect(getChartFontsSnapshot().fontManager).not.toBeNull();
        });
        const removedListener = jest.fn<ReturnType<Parameters<typeof subscribeToChartFonts>[0]>, Parameters<Parameters<typeof subscribeToChartFonts>[0]>>();
        const unsubscribe = subscribeToChartFonts(listener);
        const unsubscribeRemoved = subscribeToChartFonts(removedListener);
        unsubscribeRemoved();

        // When multiple callers request the unsettled cache.
        const first = loadChartFontsOnce();
        const second = loadChartFontsOnce();
        expect(first).toBe(second);
        expect(mockFromURI).toHaveBeenCalledTimes(11);
        expect(getChartFontsSnapshot()).toBe(empty);
        expect(listener).not.toHaveBeenCalled();
        releaseFontLoads();
        const fonts = await first;
        unsubscribe();
        const cached = await loadChartFontsOnce();

        // Then thirteen assets load once, and only the active listener sees the settled snapshot.
        expect(cached).toBe(fonts);
        expect(getChartFontsSnapshot()).toBe(fonts);
        expect(mockFromURI).toHaveBeenCalledTimes(13);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(removedListener).not.toHaveBeenCalled();
        expect(empty.fontManager).toBeNull();
        expect(Object.values(empty.typefaces).every((typeface) => typeface === null)).toBe(true);
        expect(Object.isFrozen(empty)).toBe(false);
    });

    it('keeps the same complete empty snapshot and notifies again on failed retries', async () => {
        // Given no primary font can load and a listener observes the snapshot at notification time.
        const empty = getChartFontsSnapshot();
        const listener = jest.fn(() => expect(getChartFontsSnapshot()).toBe(empty));
        const unsubscribe = subscribeToChartFonts(listener);
        mockFromURI.mockRejectedValue(new Error('offline'));

        // When the failed request is repeated.
        const first = await loadChartFontsOnce();
        const second = await loadChartFontsOnce();
        unsubscribe();

        // Then empty identity, all eleven ordered keys, and retry notifications remain stable.
        expect(first).toBe(empty);
        expect(second).toBe(empty);
        expect(ObjectUtils.typedKeys(empty.typefaces)).toEqual(ObjectUtils.typedKeys(CHART_SKIA_TYPEFACE_ASSETS));
        expect(mockFromURI).toHaveBeenCalledTimes(22);
        expect(listener).toHaveBeenCalledTimes(2);
        expect(mockFontProviderMake).not.toHaveBeenCalled();
    });

    it('registers primary families before supplemental families and reuses partial success', async () => {
        // Given one primary typeface fails while all supplemental typefaces load.
        setupSuccessfulFontLoading('EXP_NEUE_BOLD');

        // When fonts load and the cache is requested again.
        const fonts = await loadChartFontsOnce();
        const cached = await loadChartFontsOnce();

        // Then registration follows production order and the missing primary is not retried.
        expect(cached).toBe(fonts);
        expect(mockFromURI).toHaveBeenCalledTimes(13);
        expect(mockRegisterFont.mock.calls.map(([, family]) => family)).toEqual([
            'ExpensifyNeue',
            'ExpensifyNeue',
            'ExpensifyNeue',
            'ExpensifyMono',
            'ExpensifyMono',
            'ExpensifyMono',
            'ExpensifyMono',
            'ExpensifyNewKansas',
            'ExpensifyNewKansas',
            'NotoSansSymbols',
            'NotoSansSCMonths',
        ]);
        expect(mockRegisterFont).toHaveBeenNthCalledWith(1, fonts.typefaces.EXP_NEUE, 'ExpensifyNeue');
        expect(mockLogHmmm).toHaveBeenCalledTimes(1);
        expect(mockLogHmmm).toHaveBeenCalledWith('Chart font asset failed to load', {assetKey: 'EXP_NEUE_BOLD', error: 'Failed to load EXP_NEUE_BOLD'});
    });

    it('retains primary cache when supplemental loading fails', async () => {
        // Given usable primary fonts but both supplemental URLs fail.
        setupSuccessfulFontLoading();
        const successfulLoad = mockFromURI.getMockImplementation();
        expect(successfulLoad).toBeDefined();
        if (!successfulLoad) {
            throw new Error('Successful chart font loading must be configured');
        }
        mockFromURI.mockImplementation((uri) => (uri.includes('NotoSans') ? Promise.reject(new Error('supplemental unavailable')) : successfulLoad(uri)));

        // When the real manager is built and requested again.
        const fonts = await loadChartFontsOnce();
        const cached = await loadChartFontsOnce();

        // Then the primary result is cached and supplemental errors remain per key.
        expect(fonts.typefaces.EXP_NEUE).not.toBeNull();
        expect(fonts.fontManager).not.toBeNull();
        expect(cached).toBe(fonts);
        expect(mockFromURI).toHaveBeenCalledTimes(13);
        expect(mockRegisterFont).toHaveBeenCalledTimes(10);
        expect(mockLogHmmm).toHaveBeenCalledTimes(2);
        expect(mockLogHmmm).toHaveBeenCalledWith('Chart font asset failed to load', {assetKey: 'NotoSansSymbols', error: 'supplemental unavailable'});
        expect(mockLogHmmm).toHaveBeenCalledWith('Chart font asset failed to load', {assetKey: 'NotoSansSCMonths', error: 'supplemental unavailable'});
    });

    it('resolves scalar, default URL, URI object and numeric assets without unwrapping nested defaults', async () => {
        // Given every supported runtime shape, plus an explicitly unsupported nested module default.
        setupSuccessfulFontLoading();
        MOCK_CHART_FONT_ASSETS.MONOSPACE = 'mock://scalar';
        MOCK_CHART_FONT_ASSETS.MONOSPACE_BOLD = {__esModule: true, default: 'mock://default'};
        MOCK_CHART_FONT_ASSETS.MONOSPACE_ITALIC = {uri: 'mock://uri', width: 0, height: 0};
        MOCK_CHART_FONT_ASSETS.MONOSPACE_BOLD_ITALIC = 42;
        // @ts-expect-error Nested defaults model malformed interop and must remain unsupported at runtime.
        MOCK_CHART_FONT_ASSETS.EXP_NEUE_BOLD = {__esModule: true, default: {__esModule: true, default: 'mock://nested'}};
        mockResolveAssetSource.mockReturnValue({uri: 'mock://native', width: 0, height: 0, scale: 1});

        // When the actual resolver and per-key loader process these assets.
        const fonts = await loadChartFontsOnce();

        // Then supported shapes reach Skia once each and the nested shape fails only its key.
        expect(mockResolveAssetSource).toHaveBeenCalledWith(42);
        expect(mockFromURI).toHaveBeenCalledWith('mock://scalar');
        expect(mockFromURI).toHaveBeenCalledWith('mock://default');
        expect(mockFromURI).toHaveBeenCalledWith('mock://uri');
        expect(mockFromURI).toHaveBeenCalledWith('mock://native');
        expect(mockFromURI).not.toHaveBeenCalledWith('mock://nested');
        expect(fonts.typefaces.MONOSPACE).not.toBeNull();
        expect(fonts.typefaces.MONOSPACE_BOLD).not.toBeNull();
        expect(fonts.typefaces.MONOSPACE_ITALIC).not.toBeNull();
        expect(fonts.typefaces.MONOSPACE_BOLD_ITALIC).not.toBeNull();
        expect(fonts.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(mockLogHmmm).toHaveBeenCalledWith('Chart font asset failed to load', {assetKey: 'EXP_NEUE_BOLD', error: 'Unsupported chart font asset source'});
    });

    it('isolates native resolution failure before Skia reads the asset', async () => {
        // Given a registry ID whose native source cannot be resolved.
        setupSuccessfulFontLoading();
        MOCK_CHART_FONT_ASSETS.EXP_NEUE_BOLD = 42;
        mockResolveAssetSource.mockReturnValue({uri: '', width: 0, height: 0, scale: 1});

        // When the real cache loads the remaining assets.
        const fonts = await loadChartFontsOnce();

        // Then the failed key is logged and the other primary and supplemental loads complete.
        expect(mockResolveAssetSource).toHaveBeenCalledTimes(1);
        expect(mockFromURI).toHaveBeenCalledTimes(12);
        expect(fonts.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(fonts.typefaces.EXP_NEUE).not.toBeNull();
        expect(mockLogHmmm).toHaveBeenCalledWith('Chart font asset failed to load', {assetKey: 'EXP_NEUE_BOLD', error: 'Chart font asset could not be resolved'});
    });

    it('retries emoji-only success and caches a later usable primary result', async () => {
        // Given only emoji succeeds in the first request, so no usable font manager exists.
        setupSuccessfulFontLoading();
        const successfulLoad = mockFromURI.getMockImplementation();
        expect(successfulLoad).toBeDefined();
        if (!successfulLoad) {
            throw new Error('Successful chart font loading must be configured');
        }
        mockFromURI.mockImplementation((uri) => (uri.endsWith('CUSTOM_EMOJI_FONT') ? successfulLoad(uri) : Promise.reject(new Error('primary unavailable'))));
        const empty = getChartFontsSnapshot();
        const first = await loadChartFontsOnce();

        // When a usable primary becomes available on the retry.
        setupSuccessfulFontLoading();
        const second = await loadChartFontsOnce();

        // Then emoji-only success stays empty and the successful retry is cached.
        expect(first).toBe(empty);
        expect(second).not.toBe(empty);
        expect(second.fontManager).not.toBeNull();
        expect(mockFromURI).toHaveBeenCalledTimes(24);
        expect(await loadChartFontsOnce()).toBe(second);
        expect(mockFromURI).toHaveBeenCalledTimes(24);
    });
});
