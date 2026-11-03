import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import getVictoryChartTreeTypeface from '@components/Charts/utils/getVictoryChartTreeTypeface';

import type {SkTypeface} from '@shopify/react-native-skia';

function makeMockTypeface(key: string): SkTypeface {
    // Skia typefaces are native objects; tests only need a unique stand-in per key.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {id: key} as unknown as SkTypeface;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const CHART_SKIA_TYPEFACE_KEYS = Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[];

function makeTypefaces(): ChartDefaultTypeface {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.fromEntries(CHART_SKIA_TYPEFACE_KEYS.map((key) => [key, makeMockTypeface(key)])) as ChartDefaultTypeface;
}

describe('getVictoryChartTreeTypeface', () => {
    it('should fall back when EXP_NEUE failed to load but another chart typeface is available', () => {
        const typefaces = makeTypefaces();
        for (const key of CHART_SKIA_TYPEFACE_KEYS) {
            typefaces[key] = null;
        }
        typefaces.EXP_NEUE_BOLD = makeMockTypeface('EXP_NEUE_BOLD');

        expect(getVictoryChartTreeTypeface(typefaces)).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should return null when every typeface failed to load', () => {
        const typefaces = makeTypefaces();
        for (const key of CHART_SKIA_TYPEFACE_KEYS) {
            typefaces[key] = null;
        }

        expect(getVictoryChartTreeTypeface(typefaces)).toBeNull();
    });
});
