import type * as SelectionScraperModule from '@libs/SelectionScraper/index.native';

import CONST from '@src/CONST';

import {Document, Element} from 'domhandler';

// cspell:ignore mtext

// Selection scraping only exists in the web implementation; the native variant always returns an empty string.
const SelectionScraper = jest.requireActual<typeof SelectionScraperModule>('@libs/SelectionScraper/index.ts').default;

const fixtures: HTMLElement[] = [];

const selectFixture = (html: string) => {
    const fixture = document.createElement('div');
    fixture.innerHTML = html;
    document.body.append(fixture);
    fixtures.push(fixture);

    const range = document.createRange();
    range.selectNodeContents(fixture);
    const selection = window.getSelection();
    if (!selection) {
        throw new Error('Selection API is unavailable');
    }
    selection.removeAllRanges();
    selection.addRange(range);
};

describe('SelectionScraper', () => {
    afterEach(() => {
        window.getSelection()?.removeAllRanges();
        for (const fixture of fixtures) {
            fixture.remove();
        }
        fixtures.length = 0;
        jest.restoreAllMocks();
    });

    it('preserves pinned SVG foreignObject serialization', () => {
        selectFixture('<svg><foreignObject><div></div></foreignObject></svg><span>selected</span>');

        expect(SelectionScraper.getCurrentSelection()).toBe('<svg><foreignObject><div/></foreignObject></svg><span>selected</span>');
    });

    it('retains coherent transformed MathML relationships', () => {
        const documentCloneSpy = jest.spyOn(Document.prototype, 'cloneNode');
        selectFixture('<math><mtext><div>first</div><span>middle</span><p>last</p></mtext></math>');

        expect(SelectionScraper.getCurrentSelection()).toBe('<math><mtext><div>first</div><span>middle</span><p>last</p></mtext></math>');

        const firstCloneResult = documentCloneSpy.mock.results.at(0);
        if (!firstCloneResult || firstCloneResult.type !== 'return' || !(firstCloneResult.value instanceof Document)) {
            throw new Error('SelectionScraper did not clone the parsed document');
        }
        const transformedDocument = firstCloneResult.value;

        const math = transformedDocument.children.at(0);
        if (!(math instanceof Element)) {
            throw new Error('Transformed MathML root is not an element');
        }
        const mtext = math.children.at(0);
        if (!(mtext instanceof Element)) {
            throw new Error('Transformed mtext is not an element');
        }

        const [first, middle, last] = mtext.children;
        if (!first || !middle || !last || mtext.children.length !== 3) {
            throw new Error('Transformed mtext does not own the expected children');
        }
        expect(first.parent).toBe(mtext);
        expect(first.prev).toBeNull();
        expect(first.next).toBe(middle);
        expect(middle.parent).toBe(mtext);
        expect(middle.prev).toBe(first);
        expect(middle.next).toBe(last);
        expect(last.parent).toBe(mtext);
        expect(last.prev).toBe(middle);
        expect(last.next).toBeNull();
    });

    it('preserves MathML serialization when an editor child div is collapsed', () => {
        selectFixture(`<div data-testid="editor"><math><mtext><div><span></span></div></mtext></math></div><span data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}="true">selected</span>`);

        expect(SelectionScraper.getCurrentSelection()).toBe('<div><math><mtext><span/></mtext></math></div>');
    });

    it('preserves ordinary HTML transformations', () => {
        selectFixture(
            '<span data-testid="strong" class="discarded">bold &amp; <a href="https://example.com" class="discarded">link</a><br>\n</span>' +
                '<div data-testid="editor"><div><span>nested</span></div><span data-testid="email-with-break-opportunities">a\u200bb</span></div>',
        );

        expect(SelectionScraper.getCurrentSelection()).toBe('<strong>bold &amp; <a href="https://example.com">link</a><br></strong><div><span>nested</span><span>ab</span></div>');
    });
});
