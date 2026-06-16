import type {SkTypeface} from '@shopify/react-native-skia';
import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {getChartFontsSnapshot, loadChartFontsOnce, resetChartFontsCacheForTests} from '@components/Charts/utils/chartFontsCache';

const mockFromURI = jest.fn<Promise<{uri: string}>, [string]>();
const mockMakeFreeTypeFaceFromData = jest.fn<SkTypeface, [{uri: string}]>();
const mockRegisterFont = jest.fn();
const mockFontProviderMake = jest.fn(() => ({
    registerFont: mockRegisterFont,
}));

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Data: {
            fromURI: (uri: string) => mockFromURI(uri),
        },
        Typeface: {
            MakeFreeTypeFaceFromData: (data: {uri: string}) => mockMakeFreeTypeFaceFromData(data),
        },
        TypefaceFontProvider: {
            Make: () => mockFontProviderMake(),
        },
    },
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: jest.fn(),
    },
}));

jest.mock('@components/Charts/utils/chartFontAssets', () => {
    const makeAsset = (name: string) => ({
        __esModule: true,
        default: `mock://font/${name}`,
    });

    const typefaceKeys = [
        'MONOSPACE',
        'MONOSPACE_BOLD',
        'MONOSPACE_ITALIC',
        'MONOSPACE_BOLD_ITALIC',
        'EXP_NEUE',
        'EXP_NEUE_BOLD',
        'EXP_NEUE_ITALIC',
        'EXP_NEUE_BOLD_ITALIC',
        'EXP_NEW_KANSAS_MEDIUM',
        'EXP_NEW_KANSAS_MEDIUM_ITALIC',
        'CUSTOM_EMOJI_FONT',
    ];

    return {
        CHART_SKIA_TYPEFACE_ASSETS: Object.fromEntries(typefaceKeys.map((key) => [key, makeAsset(key)])),
        CHART_FONT_MGR_SUPPLEMENTAL_ASSETS: {
            NotoSansSymbols: makeAsset('NotoSansSymbols'),
            NotoSansSCMonths: makeAsset('NotoSansSCMonths'),
        },
    };
});

function makeMockTypeface(key: string): SkTypeface {
    // Skia typefaces are native objects; tests only need a unique stand-in per key.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {id: key} as unknown as SkTypeface;
}

function setupSuccessfulFontLoading(failingKey?: ChartSkiaTypefaceKey) {
    mockFromURI.mockImplementation((uri: string) => {
        const key = uri.replace('mock://font/', '');

        if (failingKey && key === failingKey) {
            return Promise.reject(new Error(`Failed to load ${key}`));
        }

        if (key === 'FAIL') {
            return Promise.reject(new Error('Failed to load font'));
        }

        return Promise.resolve({uri});
    });

    mockMakeFreeTypeFaceFromData.mockImplementation((data: {uri: string}) => makeMockTypeface(data.uri.replace('mock://font/', '')));
}

describe('chartFontsCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetChartFontsCacheForTests();
    });

    it('should resolve with null for a failed typeface and populated values for the rest', async () => {
        setupSuccessfulFontLoading('EXP_NEUE_BOLD');

        const fonts = await loadChartFontsOnce();

        expect(fonts.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(fonts.typefaces.EXP_NEUE).not.toBeNull();
        expect(fonts.fontMgr).not.toBeNull();
    });

    it('should cache partial success so getChartFontsSnapshot returns loaded typefaces', async () => {
        setupSuccessfulFontLoading('EXP_NEUE_BOLD');

        await loadChartFontsOnce();

        const snapshot = getChartFontsSnapshot();
        expect(snapshot.typefaces.EXP_NEUE_BOLD).toBeNull();
        expect(snapshot.typefaces.EXP_NEUE).not.toBeNull();
        expect(snapshot.fontMgr).not.toBeNull();
    });

    it('should return empty chart fonts when every asset fails to load', async () => {
        mockFromURI.mockRejectedValue(new Error('Failed to load font'));
        mockMakeFreeTypeFaceFromData.mockReturnValue(null);

        const fonts = await loadChartFontsOnce();

        expect(Object.values(fonts.typefaces).every((typeface) => typeface === null)).toBe(true);
        expect(fonts.fontMgr).toBeNull();
    });
});
