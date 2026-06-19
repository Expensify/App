import type {SkTypeface} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';

const CHART_SKIA_TYPEFACE_KEYS = Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[];

function makeTypefaces(): ChartDefaultTypeface {
    return Object.fromEntries(CHART_SKIA_TYPEFACE_KEYS.map((key) => [key, {id: key} as unknown as SkTypeface])) as ChartDefaultTypeface;
}

describe('getChartSkiaTypeface', () => {
    const typefaces = makeTypefaces();

    it('should resolve numeric bold weight to the bold typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 700});
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve string bold weight to the bold typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 'bold'});
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve normal weight to the regular typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 400});
        expect(typeface).toBe(typefaces.EXP_NEUE);
    });

    it('should resolve semibold numeric weight to the bold typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 600});
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve medium numeric weight to the regular typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 500});
        expect(typeface).toBe(typefaces.EXP_NEUE);
    });

    it('should resolve Expensify New Kansas by font family', () => {
        const typeface = getChartSkiaTypeface(typefaces, {fontFamily: 'Expensify New Kansas'});
        expect(typeface).toBe(typefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should resolve italic Expensify Neue bold to the bold italic typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: 'Expensify Neue',
            fontStyle: 'italic',
            fontWeight: 'bold',
        });
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD_ITALIC);
    });
});
