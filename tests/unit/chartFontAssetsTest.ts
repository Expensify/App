import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import type * as ChartWebAssetsModule from '@components/Charts/utils/chartFontAssets';
import type * as ChartNativeAssetsModule from '@components/Charts/utils/chartFontAssets.native';
import {CHART_FONT_MGR_FROM_TYPEFACES} from '@components/Charts/utils/chartFontConstants';
import type * as ChartFontsCacheModule from '@components/Charts/utils/chartFontsCache';
import type * as ChartWebFontModule from '@components/Charts/utils/chartWebFont';

import type Log from '@libs/Log';

import type {SkData, SkTypeface, SkTypefaceFontProvider, Skia} from '@shopify/react-native-skia';
import type * as SkiaDataModule from '@shopify/react-native-skia/src/skia/types/Data/Data';
import type ReactNativeModule from 'react-native';

import createMock from '../utils/createMock';

// Filenames come from chartFontAssets.native.ts and chartFontAssets.ts.
// Keeping this table independent catches swapped or missing file associations.
const CHART_FONT_FILES: Record<ChartSkiaTypefaceKey, string> = {
    MONOSPACE: 'ExpensifyMono-Regular',
    MONOSPACE_BOLD: 'ExpensifyMono-Bold',
    MONOSPACE_ITALIC: 'ExpensifyMono-Italic',
    MONOSPACE_BOLD_ITALIC: 'ExpensifyMono-BoldItalic',
    EXP_NEUE: 'ExpensifyNeue-Regular',
    EXP_NEUE_BOLD: 'ExpensifyNeue-Bold',
    EXP_NEUE_ITALIC: 'ExpensifyNeue-Italic',
    EXP_NEUE_BOLD_ITALIC: 'ExpensifyNeue-BoldItalic',
    EXP_NEW_KANSAS_MEDIUM: 'ExpensifyNewKansas-Medium',
    EXP_NEW_KANSAS_MEDIUM_ITALIC: 'ExpensifyNewKansas-MediumItalic',
    CUSTOM_EMOJI_FONT: 'CustomEmoji',
};
const SUPPLEMENTAL_FONT_FILES = ['NotoSans-Symbols.ttf', 'NotoSansSC-Months.ttf'] as const;
const PRIMARY_FONT_COUNT = Object.keys(CHART_FONT_FILES).length;
const SUPPLEMENTAL_FONT_COUNT = SUPPLEMENTAL_FONT_FILES.length;
const TOTAL_FONT_COUNT = PRIMARY_FONT_COUNT + SUPPLEMENTAL_FONT_COUNT;
const PRIMARY_REGISTRATION_COUNT = Object.values(CHART_FONT_MGR_FROM_TYPEFACES).flat().length;
const mockLogHmmm = jest.fn<ReturnType<typeof Log.hmmm>, Parameters<typeof Log.hmmm>>();
const mockFromURI = jest.fn<ReturnType<typeof Skia.Data.fromURI>, Parameters<typeof Skia.Data.fromURI>>();
const mockMakeTypeface = jest.fn<ReturnType<typeof Skia.Typeface.MakeFreeTypeFaceFromData>, Parameters<typeof Skia.Typeface.MakeFreeTypeFaceFromData>>();
const mockRegisterFont = jest.fn<ReturnType<SkTypefaceFontProvider['registerFont']>, Parameters<SkTypefaceFontProvider['registerFont']>>();
const mockFontProviderMake = jest.fn<ReturnType<typeof Skia.TypefaceFontProvider.Make>, Parameters<typeof Skia.TypefaceFontProvider.Make>>(() =>
    createMock<SkTypefaceFontProvider>({registerFont: mockRegisterFont}),
);
const mockResolveAssetSource = jest.fn<ReturnType<typeof ReactNativeModule.Image.resolveAssetSource>, Parameters<typeof ReactNativeModule.Image.resolveAssetSource>>();
const mockLoadedTypefaces = new Map<string, SkTypeface>();
const mockFontDataURIs = new Map<SkData, string>();

jest.mock('@shopify/react-native-skia', () => ({
    unwrapModule: jest.requireActual<typeof SkiaDataModule>('@shopify/react-native-skia/src/skia/types/Data/Data').unwrapModule,
    Skia: {
        Data: {fromURI: (...args: Parameters<typeof Skia.Data.fromURI>) => mockFromURI(...args)},
        Typeface: {MakeFreeTypeFaceFromData: (...args: Parameters<typeof Skia.Typeface.MakeFreeTypeFaceFromData>) => mockMakeTypeface(...args)},
        TypefaceFontProvider: {Make: (...args: Parameters<typeof Skia.TypefaceFontProvider.Make>) => mockFontProviderMake(...args)},
    },
}));

jest.mock('@libs/Log', () => ({__esModule: true, default: {hmmm: (...args: Parameters<typeof Log.hmmm>) => mockLogHmmm(...args)}}));

function setupChartFontAssets(
    platform: 'native' | 'web',
    moduleShape: 'scalar' | 'default',
    ttfRepresentation: 'url' | 'numeric' = 'url',
): {
    assets: typeof ChartNativeAssetsModule | typeof ChartWebAssetsModule;
    cache: typeof ChartFontsCacheModule;
    fontFiles: string[];
} {
    const primaryFiles = Object.values(CHART_FONT_FILES).map((file) => {
        if (file === 'CustomEmoji') {
            return `${platform}/CustomEmoji${platform === 'native' ? 'Native' : 'Web'}Font.ttf`;
        }
        return `${platform}/${file}.${platform === 'native' ? 'otf' : 'woff2'}`;
    });
    const fontFiles = [...primaryFiles, ...SUPPLEMENTAL_FONT_FILES];
    for (const [index, file] of fontFiles.entries()) {
        const asset = platform === 'native' || (ttfRepresentation === 'numeric' && file.endsWith('.ttf')) ? index + 1 : `mock://font/${file}`;
        jest.doMock(`@assets/fonts/${file}`, () => (moduleShape === 'default' ? {__esModule: true, default: asset} : asset));
    }
    const {Image: nativeImage} = jest.requireActual<typeof ReactNativeModule>('react-native');
    jest.spyOn(nativeImage, 'resolveAssetSource').mockImplementation((...args) => mockResolveAssetSource(...args));
    mockResolveAssetSource.mockImplementation((source) => {
        if (typeof source !== 'number') {
            throw new Error('Expected a native font registry ID');
        }
        const file = fontFiles.at(source - 1);
        if (!file) {
            throw new Error('Unknown native chart font registry ID');
        }
        return {uri: `mock://font/${file}`, width: 0, height: 0, scale: 1};
    });
    mockFromURI.mockImplementation(async (uri) => {
        const data = createMock<SkData>({});
        mockFontDataURIs.set(data, uri);
        return data;
    });
    mockMakeTypeface.mockImplementation((data) => {
        const uri = mockFontDataURIs.get(data);
        if (!uri) {
            throw new Error('Expected data returned by chart font loading');
        }
        const typeface = createMock<SkTypeface>({});
        mockLoadedTypefaces.set(uri, typeface);
        return typeface;
    });

    // Forwarding the actual platform module lets the cache exercise its real asset handling.
    const assets =
        platform === 'native'
            ? jest.requireActual<typeof ChartNativeAssetsModule>('@components/Charts/utils/chartFontAssets.native')
            : jest.requireActual<typeof ChartWebAssetsModule>('@components/Charts/utils/chartFontAssets.ts');
    jest.doMock('@components/Charts/utils/chartFontAssets', () => assets);
    const cache = jest.requireActual<typeof ChartFontsCacheModule>('@components/Charts/utils/chartFontsCache');
    return {assets, cache, fontFiles};
}

describe('chartFontAssets', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        mockLoadedTypefaces.clear();
        mockFontDataURIs.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {platform: 'native', moduleShape: 'scalar', ttfRepresentation: 'numeric'},
        {platform: 'native', moduleShape: 'default', ttfRepresentation: 'numeric'},
        {platform: 'web', moduleShape: 'scalar', ttfRepresentation: 'url'},
        {platform: 'web', moduleShape: 'scalar', ttfRepresentation: 'numeric'},
        {platform: 'web', moduleShape: 'default', ttfRepresentation: 'url'},
        {platform: 'web', moduleShape: 'default', ttfRepresentation: 'numeric'},
    ] as const)('loads real $platform assets from $moduleShape exports with $ttfRepresentation TTF values', async ({platform, moduleShape, ttfRepresentation}) => {
        // Given distinct files expose swapped associations across URL and native ID producers.
        const {assets, cache, fontFiles} = setupChartFontAssets(platform, moduleShape, ttfRepresentation);
        const expectedURIs = fontFiles.map((file) => `mock://font/${file}`);
        const expectedAssetValues = fontFiles.map((file, index) => (platform === 'native' || (ttfRepresentation === 'numeric' && file.endsWith('.ttf')) ? index + 1 : `mock://font/${file}`));

        // When each platform entry feeds its producer values through the cache and installed Skia asset resolver.
        const fonts = await cache.loadChartFontsOnce();

        // Then every primary/supplemental association and its insertion order survives interop.
        expect(Object.keys(assets.CHART_SKIA_TYPEFACE_ASSETS)).toEqual(Object.keys(CHART_FONT_FILES));
        expect(Object.keys(assets.CHART_FONT_MGR_SUPPLEMENTAL_ASSETS)).toEqual(['NotoSansSymbols', 'NotoSansSCMonths']);
        expect(Object.values(assets.CHART_SKIA_TYPEFACE_ASSETS)).toEqual(
            expectedAssetValues.slice(0, PRIMARY_FONT_COUNT).map((asset) => (platform === 'native' ? asset : {__esModule: true, default: asset})),
        );
        expect(Object.values(assets.CHART_FONT_MGR_SUPPLEMENTAL_ASSETS)).toEqual(
            expectedAssetValues.slice(PRIMARY_FONT_COUNT).map((asset) => (platform === 'native' ? asset : {__esModule: true, default: asset})),
        );
        expect(mockFromURI.mock.calls.map(([uri]) => uri)).toEqual(expectedURIs);
        expect(mockMakeTypeface).toHaveBeenCalledTimes(TOTAL_FONT_COUNT);
        expect(Object.keys(fonts.typefaces)).toEqual(Object.keys(CHART_FONT_FILES));
        for (const [index, uri] of expectedURIs.slice(0, PRIMARY_FONT_COUNT).entries()) {
            const expectedTypeface = mockLoadedTypefaces.get(uri);
            expect(expectedTypeface).toBeDefined();
            expect(Object.values(fonts.typefaces).at(index)).toBe(expectedTypeface);
        }
        expect(mockResolveAssetSource.mock.calls.map(([source]) => source)).toEqual(expectedAssetValues.filter((asset) => typeof asset === 'number'));
        expect(fonts.fontManager).not.toBeNull();
        expect(mockRegisterFont.mock.calls.map(([, family]) => family)).toEqual([
            'ExpensifyNeue',
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
        for (const [index, file] of SUPPLEMENTAL_FONT_FILES.entries()) {
            const family = Object.keys(assets.CHART_FONT_MGR_SUPPLEMENTAL_ASSETS).at(index);
            expect(family).toBeDefined();
            const supplementalTypeface = mockLoadedTypefaces.get(`mock://font/${file}`);
            expect(supplementalTypeface).toBeDefined();
            expect(supplementalTypeface).not.toBeNull();
            expect(mockRegisterFont).toHaveBeenNthCalledWith(PRIMARY_REGISTRATION_COUNT + index + 1, supplementalTypeface, family);
        }
        expect(mockLogHmmm).not.toHaveBeenCalled();
        expect(await cache.loadChartFontsOnce()).toBe(fonts);
        expect(mockFromURI).toHaveBeenCalledTimes(TOTAL_FONT_COUNT);
    });

    it('loads the numeric default produced by chartWebFont through native asset resolution', async () => {
        // Given chartWebFont accepts the numeric output used by Metro/Jest font producers.
        const {cache} = setupChartFontAssets('web', 'scalar');
        const chartWebFont = jest.requireActual<typeof ChartWebFontModule>('@components/Charts/utils/chartWebFont').default;
        const numericFont = chartWebFont(42);
        expect(numericFont).toEqual({__esModule: true, default: 42});
        const webAssets = jest.requireActual<typeof ChartWebAssetsModule>('@components/Charts/utils/chartFontAssets.ts');
        webAssets.CHART_SKIA_TYPEFACE_ASSETS.EXP_NEUE_BOLD = numericFont;

        mockResolveAssetSource.mockReturnValue({uri: 'mock://numeric-web-font', width: 0, height: 0, scale: 1});

        // When the wrapper reaches the installed asset resolver and resolves its native registry ID.
        const fonts = await cache.loadChartFontsOnce();

        // Then the numeric wrapper produces a loaded primary and remains cached with the URL fonts.
        const numericTypeface = mockLoadedTypefaces.get('mock://numeric-web-font');
        expect(numericTypeface).toBeDefined();
        expect(fonts.typefaces.EXP_NEUE_BOLD).toBe(numericTypeface);
        expect(fonts.typefaces.EXP_NEUE_BOLD).not.toBeNull();
        expect(fonts.typefaces.EXP_NEUE).not.toBeNull();
        expect(mockResolveAssetSource).toHaveBeenCalledWith(42);
        expect(mockFromURI).toHaveBeenCalledWith('mock://numeric-web-font');
        expect(mockFromURI).toHaveBeenCalledTimes(TOTAL_FONT_COUNT);
        expect(mockLogHmmm).not.toHaveBeenCalled();
        expect(await cache.loadChartFontsOnce()).toBe(fonts);
        expect(mockFromURI).toHaveBeenCalledTimes(TOTAL_FONT_COUNT);
    });
});
