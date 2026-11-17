import NATIVE_TAB_GLYPHS from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';

import {readFileSync} from 'fs';
import path from 'path';

type ParsedSvg = {
    viewBoxSize: number | undefined;
    paths: Array<{d: string | undefined; isEvenOdd: boolean}>;
};

/** Reads the viewBox and paths of an SVG in `assets/images`, resolving `fill-rule` set by attribute or by a class in its style block. */
function parseSvg(fileName: string): ParsedSvg {
    const svg = readFileSync(path.resolve(__dirname, '../../assets/images', fileName), 'utf8');
    const viewBox = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    const evenOddClasses = new Set([...svg.matchAll(/\.([\w-]+)\s*\{[^}]*fill-rule:\s*evenodd/g)].map((match) => match[1]));
    const paths = [...svg.matchAll(/<path\b([^>]*)>/g)].map(([, attributes]) => {
        const className = / class="([^"]+)"/.exec(attributes)?.[1];
        return {
            d: / d="([^"]+)"/.exec(attributes)?.[1],
            isEvenOdd: attributes.includes('fill-rule="evenodd"') || (!!className && evenOddClasses.has(className)),
        };
    });
    return {viewBoxSize: viewBox?.[1] === viewBox?.[2] ? Number(viewBox?.[1]) : undefined, paths};
}

describe('NATIVE_TAB_GLYPHS', () => {
    it.each([
        [FLAT_NAV_TAB_BAR_SLOT.EXPENSES, 'receipt.svg'],
        [FLAT_NAV_TAB_BAR_SLOT.REPORTS, 'document.svg'],
        [FLAT_NAV_TAB_BAR_SLOT.MORE, 'caret-up-down.svg'],
    ])('should match the source SVG of the %s slot glyph', (slot, fileName) => {
        // Given a slot glyph, which is a hand copy of an SVG in assets/images because Skia draws the bar icons from path data
        const glyph = NATIVE_TAB_GLYPHS[slot];

        // When its source SVG is read
        const svg = parseSvg(fileName);

        // Then the copy draws the same shape, so an edit to the SVG that is not copied over fails here instead of shipping a stale icon
        expect(glyph.viewBoxSize).toBe(svg.viewBoxSize);
        expect(glyph.paths.map((glyphPath) => ({d: glyphPath.d, isEvenOdd: 'isEvenOdd' in glyphPath && glyphPath.isEvenOdd}))).toEqual(svg.paths);
    });
});
