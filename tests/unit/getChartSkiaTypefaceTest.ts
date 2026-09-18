import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';

import FontUtils from '@styles/utils/FontUtils';

import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {SkTypeface} from '@shopify/react-native-skia';

import createMock from '../utils/createMock';

const CHART_SKIA_TYPEFACE_KEYS = ObjectUtils.typedKeys(CHART_SKIA_TYPEFACE_ASSETS);

function makeTypefaces(): ChartDefaultTypeface {
    return ObjectUtils.typedFromEntries(CHART_SKIA_TYPEFACE_KEYS.map((key) => [key, createMock<SkTypeface>({})] as const));
}

/** Simulates a typeface whose glyph coverage excludes every character in `unsupportedChars`. */
function makeTypefaceWithGlyphCoverage(unsupportedChars: string): SkTypeface {
    return createMock<SkTypeface>({
        getGlyphIDs: (text: string) => [...text].map((char) => (unsupportedChars.includes(char) ? 0 : 1)),
    });
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
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily,
        });
        expect(typeface).toBe(typefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should resolve italic Expensify Neue bold to the bold italic typeface', () => {
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEUE.fontFamily,
            fontStyle: 'italic',
            fontWeight: 'bold',
        });
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD_ITALIC);
    });

    it('should fall back to EXP_NEUE when the bold variant failed to load', () => {
        const partialTypefaces = {
            ...typefaces,
            EXP_NEUE_BOLD: null,
        };

        const typeface = getChartSkiaTypeface(partialTypefaces, {
            fontWeight: 700,
        });
        expect(typeface).toBe(partialTypefaces.EXP_NEUE);
    });

    it('should fall back to EXP_NEUE when Expensify New Kansas failed to load', () => {
        const partialTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: null,
            EXP_NEW_KANSAS_MEDIUM_ITALIC: null,
        };

        const typeface = getChartSkiaTypeface(partialTypefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily,
        });
        expect(typeface).toBe(partialTypefaces.EXP_NEUE);
    });

    it('should return null when every typeface failed to load', () => {
        const emptyTypefaces = makeTypefaces();
        for (const key of CHART_SKIA_TYPEFACE_KEYS) {
            emptyTypefaces[key] = null;
        }

        const typeface = getChartSkiaTypeface(emptyTypefaces, {fontWeight: 700});
        expect(typeface).toBeNull();
    });

    it('should keep the resolved typeface when it can render the given text', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '$59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should fall back to EXP_NEUE_BOLD when Expensify New Kansas cannot render the given text', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
            EXP_NEUE_BOLD: makeTypefaceWithGlyphCoverage(''),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '₫59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD);
    });

    it('should fall back to EXP_NEUE_BOLD_ITALIC when italic Expensify New Kansas cannot render the given text', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM_ITALIC: makeTypefaceWithGlyphCoverage('₫'),
            EXP_NEUE_BOLD_ITALIC: makeTypefaceWithGlyphCoverage(''),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily, fontStyle: 'italic'}, '₫59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD_ITALIC);
    });

    it('should ignore newlines when checking glyph coverage', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, 'Total\n$59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });
});
