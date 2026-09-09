import {screen} from '@testing-library/react-native';

import useChartFonts from '@components/Charts/hooks/useChartFonts';
import {resetChartFontsCacheForTests} from '@components/Charts/utils/chartFontsCache';

import React from 'react';
import {View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

/**
 * The Insights charts load their Skia typefaces through `useChartFonts`, whose mount effect starts the load. Covering
 * and uncovering the Home tab re-runs that effect, so this suite proves the font assets are fetched once per session
 * no matter how often the charts are hidden and revealed.
 *
 * The Skia and asset mocks mirror tests/unit/chartFontsCacheTest.ts so the real cache runs against the same fake fonts.
 */
const mockFromURI = jest.fn<Promise<{uri: string}>, [string]>();
// Skia typefaces are native objects; the cache only checks them for null, so a tagged stand-in per key is enough.
type MockTypeface = {id: string};

const mockMakeFreeTypeFaceFromData = jest.fn<MockTypeface | null, [{uri: string}]>();
const mockRegisterFont = jest.fn();

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Data: {
            fromURI: (uri: string) => mockFromURI(uri),
        },
        Typeface: {
            MakeFreeTypeFaceFromData: (data: {uri: string}) => mockMakeFreeTypeFaceFromData(data),
        },
        TypefaceFontProvider: {
            Make: () => ({registerFont: mockRegisterFont}),
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

// Eleven Skia typefaces plus the two supplemental font-manager assets, each fetched exactly once per successful load.
const FONT_ASSET_FETCHES_PER_LOAD = 13;

function setupSuccessfulFontLoading() {
    mockFromURI.mockImplementation((uri: string) => Promise.resolve({uri}));
    mockMakeFreeTypeFaceFromData.mockImplementation((data: {uri: string}) => ({id: data.uri.replace('mock://font/', '')}));
}

/** Stands in for a chart: the real hook drives the load and the testID says whether the font manager has arrived. */
function ChartFontsProbe() {
    const fonts = useChartFonts();

    return <View testID={fonts.fontManager ? 'chart-fonts-loaded' : 'chart-fonts-empty'} />;
}

describe('useChartFonts under a screen cover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetChartFontsCacheForTests();
        setupSuccessfulFontLoading();
    });

    it('fetches the font assets once across mount, hide and reveal', async () => {
        const home = renderScreenWithCover(<ChartFontsProbe />);
        await waitForBatchedUpdatesWithAct();

        expect(mockFromURI).toHaveBeenCalledTimes(FONT_ASSET_FETCHES_PER_LOAD);
        expect(screen.getByTestId('chart-fonts-loaded')).toBeOnTheScreen();

        await home.hide();
        await home.reveal();

        expect(mockFromURI).toHaveBeenCalledTimes(FONT_ASSET_FETCHES_PER_LOAD);
        expect(screen.getByTestId('chart-fonts-loaded')).toBeOnTheScreen();
    });

    it('does not start a second load when the screen is covered while the first load is in flight', async () => {
        const home = renderScreenWithCover(<ChartFontsProbe />, {startCovered: true});
        await waitForBatchedUpdatesWithAct();

        expect(mockFromURI).toHaveBeenCalledTimes(FONT_ASSET_FETCHES_PER_LOAD);

        await home.reveal();

        expect(mockFromURI).toHaveBeenCalledTimes(FONT_ASSET_FETCHES_PER_LOAD);
        expect(screen.getByTestId('chart-fonts-loaded')).toBeOnTheScreen();
    });

    it('shares one load between two charts that are hidden and revealed together', async () => {
        const home = renderScreenWithCover(
            <>
                <ChartFontsProbe />
                <ChartFontsProbe />
            </>,
        );
        await waitForBatchedUpdatesWithAct();

        await home.hide();
        await home.reveal();

        expect(mockFromURI).toHaveBeenCalledTimes(FONT_ASSET_FETCHES_PER_LOAD);
        expect(screen.getAllByTestId('chart-fonts-loaded')).toHaveLength(2);
        expect(screen.queryByTestId('chart-fonts-empty')).not.toBeOnTheScreen();
    });
});
