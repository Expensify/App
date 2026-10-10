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
        // Given numeric CSS weights above 600 require a bold face.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 700});
        // Then the label uses the bold Neue face.
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve string bold weight to the bold typeface', () => {
        // Given the bold keyword must select the same face as a numeric bold weight.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 'bold'});
        // Then the label uses the bold Neue face.
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve normal weight to the regular typeface', () => {
        // Given a 400 weight is below the bold threshold.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 400});
        // Then the label uses regular Neue.
        expect(typeface).toBe(typefaces.EXP_NEUE);
    });

    it('should resolve semibold numeric weight to the bold typeface', () => {
        // Given 600 is the inclusive boundary for bold selection.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 600});
        // Then the label uses bold Neue at that boundary.
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD);
    });

    it('should resolve medium numeric weight to the regular typeface', () => {
        // Given a medium 500 weight is still below the bold threshold.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {fontWeight: 500});
        // Then the label retains regular Neue.
        expect(typeface).toBe(typefaces.EXP_NEUE);
    });

    it('should resolve Expensify New Kansas by font family', () => {
        // Given Kansas has a medium face registered under its production family name.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily,
        });
        // Then the exact Kansas face is returned.
        expect(typeface).toBe(typefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should resolve italic Expensify Neue bold to the bold italic typeface', () => {
        // Given style and weight must jointly select the Neue variant.
        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEUE.fontFamily,
            fontStyle: 'italic',
            fontWeight: 'bold',
        });
        // Then the returned face satisfies both italic style and bold weight.
        expect(typeface).toBe(typefaces.EXP_NEUE_BOLD_ITALIC);
    });

    it('should fall back to EXP_NEUE when the bold variant failed to load', () => {
        // Given a missing Neue bold face must degrade to the loaded regular face.
        const partialTypefaces = {
            ...typefaces,
            EXP_NEUE_BOLD: null,
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(partialTypefaces, {
            fontWeight: 700,
        });
        // Then the same-family regular Neue fallback is returned.
        expect(typeface).toBe(partialTypefaces.EXP_NEUE);
    });

    it('should fall back to EXP_NEUE when Expensify New Kansas failed to load', () => {
        // Given neither Kansas variant is available to render the label.
        const partialTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: null,
            EXP_NEW_KANSAS_MEDIUM_ITALIC: null,
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(partialTypefaces, {
            fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily,
        });
        // Then the loaded Neue face supplies the general fallback.
        expect(typeface).toBe(partialTypefaces.EXP_NEUE);
    });

    it('should return null when every typeface failed to load', () => {
        // Given no loaded face can satisfy any fallback.
        const emptyTypefaces = makeTypefaces();
        for (const key of CHART_SKIA_TYPEFACE_KEYS) {
            emptyTypefaces[key] = null;
        }

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(emptyTypefaces, {fontWeight: 700});
        // Then the result stays null without inventing a typeface.
        expect(typeface).toBeNull();
    });

    it('should keep the resolved typeface when it can render the given text', () => {
        // Given Kansas supports dollar labels despite lacking the dong symbol.
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '$59');
        // Then supported text keeps its Kansas typeface identity.
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it('should fall back to EXP_NEUE_BOLD when Expensify New Kansas cannot render the given text', () => {
        // Given Kansas lacks the dong symbol but Neue bold supports it.
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
            EXP_NEUE_BOLD: makeTypefaceWithGlyphCoverage(''),
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, '₫59');
        // Then the broader Neue bold face renders the currency label.
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD);
    });

    it('should fall back to EXP_NEUE_BOLD_ITALIC when italic Expensify New Kansas cannot render the given text', () => {
        // Given Kansas italic lacks the dong symbol but Neue bold italic supports it.
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM_ITALIC: makeTypefaceWithGlyphCoverage('₫'),
            EXP_NEUE_BOLD_ITALIC: makeTypefaceWithGlyphCoverage(''),
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily, fontStyle: 'italic'}, '₫59');
        // Then the glyph fallback retains italic style through Neue bold italic.
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD_ITALIC);
    });

    it('should ignore newlines when checking glyph coverage', () => {
        // Given line separators have no printable glyph and must not displace supported Kansas text.
        const glyphAwareTypefaces = {
            ...typefaces,
            EXP_NEW_KANSAS_MEDIUM: makeTypefaceWithGlyphCoverage('₫'),
        };

        // When the real selector resolves the requested label.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, 'Total\n$59');
        // Then the newline does not change the selected Kansas typeface.
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEW_KANSAS_MEDIUM);
    });

    it.each(['normal', 'italic'] as const)('ignores bold weight for Kansas %s', (fontStyle) => {
        // Given Kansas has medium and medium italic faces but no bold face.
        const expected = fontStyle === 'italic' ? typefaces.EXP_NEW_KANSAS_MEDIUM_ITALIC : typefaces.EXP_NEW_KANSAS_MEDIUM;

        // When a bold Kansas label is selected.
        const typeface = getChartSkiaTypeface(typefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily, fontStyle, fontWeight: 900});

        // Then weight does not change the Kansas style.
        expect(typeface).toBe(expected);
    });

    it.each([FontUtils.fontFamily.single.SYSTEM.fontFamily, 'unknown-chart-family'])('falls back to Neue for unregistered family %s', (fontFamily) => {
        // Given SYSTEM and unknown names are outside the chart font family registry.
        // When a bold italic label requests that family.
        const typeface = getChartSkiaTypeface(typefaces, {fontFamily, fontStyle: 'italic', fontWeight: 700});

        // Then the family lookup falls back to regular Neue rather than admitting SYSTEM.
        expect(typeface).toBe(typefaces.EXP_NEUE);
    });

    it.each([
        {fontStyle: 'normal', fontWeight: 400, key: 'MONOSPACE'},
        {fontStyle: 'normal', fontWeight: '600', key: 'MONOSPACE_BOLD'},
        {fontStyle: 'italic', fontWeight: 'normal', key: 'MONOSPACE_ITALIC'},
        {fontStyle: 'italic', fontWeight: 'bold', key: 'MONOSPACE_BOLD_ITALIC'},
        {fontStyle: 'oblique', fontWeight: 500, key: 'MONOSPACE'},
    ] as const)('selects monospace $fontStyle/$fontWeight', ({fontStyle, fontWeight, key}) => {
        // Given Mono exposes all four normal/bold/italic combinations.
        // When the real selector normalizes a label style and weight.
        const typeface = getChartSkiaTypeface(typefaces, {fontFamily: FontUtils.fontFamily.single.MONOSPACE.fontFamily, fontStyle, fontWeight});

        // Then style normalization and the 600 threshold select the exact face.
        expect(typeface).toBe(typefaces[key]);
    });

    it('prefers an available same-family face over Neue and an earlier unrelated face', () => {
        // Given bold italic Mono failed but regular Mono and Neue both loaded.
        const partialTypefaces = {...typefaces, MONOSPACE_BOLD_ITALIC: null};

        // When a bold italic Mono label needs a fallback.
        const typeface = getChartSkiaTypeface(partialTypefaces, {fontFamily: FontUtils.fontFamily.single.MONOSPACE.fontFamily, fontStyle: 'italic', fontWeight: 700});

        // Then the existing same-family fallback order wins over the general Neue fallback.
        expect(typeface).toBe(partialTypefaces.MONOSPACE_BOLD);
    });

    it('uses first-available insertion order after same-family and Neue fallbacks are exhausted', () => {
        // Given only Kansas and emoji loaded, with emoji deliberately inserted first.
        const orderedTypefaces = ObjectUtils.typedFromEntries([...CHART_SKIA_TYPEFACE_KEYS].reverse().map((key) => [key, typefaces[key]] as const));
        for (const key of CHART_SKIA_TYPEFACE_KEYS) {
            orderedTypefaces[key] = key === 'CUSTOM_EMOJI_FONT' || key === 'EXP_NEW_KANSAS_MEDIUM' ? typefaces[key] : null;
        }

        // When a missing Mono family falls through to the first available face.
        const typeface = getChartSkiaTypeface(orderedTypefaces, {fontFamily: FontUtils.fontFamily.single.MONOSPACE.fontFamily});

        // Then insertion order is retained rather than sorting by family or key.
        expect(typeface).toBe(orderedTypefaces.CUSTOM_EMOJI_FONT);
    });

    it.each([undefined, ''])('does not query glyphs for absent or empty text %s', (text) => {
        // Given the resolved face reports no printable glyphs.
        const getGlyphIDs = jest.fn<ReturnType<SkTypeface['getGlyphIDs']>, Parameters<SkTypeface['getGlyphIDs']>>(() => [0]);
        const glyphAwareTypefaces = {...typefaces, EXP_NEUE: createMock<SkTypeface>({getGlyphIDs})};

        // When no text needs to be rendered.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {}, text);

        // Then selection retains the face without asking for coverage.
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE);
        expect(getGlyphIDs).not.toHaveBeenCalled();
    });

    it('skips ASCII controls but checks printable characters for missing glyphs', () => {
        // Given Kansas lacks the printable currency symbol and every ASCII control glyph.
        const controls = Array.from({length: 0x20}, (_, codePoint) => String.fromCodePoint(codePoint)).join('');
        const getGlyphIDs = jest.fn<ReturnType<SkTypeface['getGlyphIDs']>, Parameters<SkTypeface['getGlyphIDs']>>((text) => (controls.includes(text) || text === '₫' ? [0] : [1]));
        const glyphAwareTypefaces = {...typefaces, EXP_NEW_KANSAS_MEDIUM: createMock<SkTypeface>({getGlyphIDs})};

        // When controls precede a printable symbol the selected face cannot render.
        const typeface = getChartSkiaTypeface(glyphAwareTypefaces, {fontFamily: FontUtils.fontFamily.single.EXP_NEW_KANSAS_MEDIUM.fontFamily}, `${controls}₫`);

        // Then only the printable glyph is queried and Kansas falls back to Neue bold.
        expect(getGlyphIDs).toHaveBeenCalledTimes(1);
        expect(getGlyphIDs).toHaveBeenCalledWith('₫');
        expect(typeface).toBe(glyphAwareTypefaces.EXP_NEUE_BOLD);
    });
});
