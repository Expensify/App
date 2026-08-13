import type {ChartDefaultTypeface, ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_SKIA_TYPEFACE_ASSETS} from '@components/Charts/utils/chartFontAssets';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';

import FontUtils from '@styles/utils/FontUtils';

import type {SkTypeface} from '@shopify/react-native-skia';

const CHART_SKIA_TYPEFACE_KEYS = Object.keys(CHART_SKIA_TYPEFACE_ASSETS) as ChartSkiaTypefaceKey[];

function makeTypefaces(): ChartDefaultTypeface {
    return Object.fromEntries(CHART_SKIA_TYPEFACE_KEYS.map((key) => [key, {id: key} as unknown as SkTypeface])) as ChartDefaultTypeface;
}

/** Simulates a typeface whose glyph coverage excludes every character in `unsupportedChars`. */
function makeTypefaceWithGlyphCoverage(key: ChartSkiaTypefaceKey, unsupportedChars: string): SkTypeface {
    return {
        id: key,
        getGlyphIDs: (text: string) => [...text].map((char) => (unsupportedChars.includes(char) ? 0 : 1)),
    } as unknown as SkTypeface;
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
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('EXP_NEW_KANSAS_MEDIUM', '₫'),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '$59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should fall back to EXP_NEUE_BOLD when Expensify New Kansas cannot render the given text', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('EXP_NEW_KANSAS_MEDIUM', '₫'),
            EXP_NEUE_BOLD: makeTypefaceWithGlyphCoverage('EXP_NEUE_BOLD', ''),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '₫59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD);
    });

    it('should fall back to EXP_NEUE_BOLD_ITALIC when italic Expensify New Kansas cannot render the given text', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM_ITALIC: makeTypefaceWithGlyphCoverage('EXP_NEW_KANSAS_MEDIUM_ITALIC', '₫'),
            EXP_NEUE_BOLD_ITALIC: makeTypefaceWithGlyphCoverage('EXP_NEUE_BOLD_ITALIC', ''),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily, fontStyle: 'italic'}, '₫59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD_ITALIC);
    });

    it('should ignore newlines when checking glyph coverage', () => {
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('EXP_NEW_KANSAS_MEDIUM', '₫'),
        };

        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, 'Total\n$59');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });
});
