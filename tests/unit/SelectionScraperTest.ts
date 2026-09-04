import type * as SelectionScraperWebModule from '@libs/SelectionScraper/index';

import CONST from '@src/CONST';

import {Element, Text} from 'domhandler';

// cspell:ignore mtext

// Selection scraping only exists in the web implementation. The native variant always returns an empty string.
const {default: SelectionScraper, installTransformedChildren} = jest.requireActual<typeof SelectionScraperWebModule>('@libs/SelectionScraper/index.ts');

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
    });

    it('serializes HTML children in SVG foreignObject with paired tags', () => {
        selectFixture('<svg><foreignObject><div></div></foreignObject></svg><span>selected</span>');

        expect(SelectionScraper.getCurrentSelection()).toBe('<svg><foreignObject><div></div></foreignObject></svg><span>selected</span>');
    });

    it('installs transformed children with coherent parent and sibling links', () => {
        const parent = new Element('div', {});
        const first = new Text('first');
        const middle = new Text('middle');
        const last = new Text('last');
        const children = [first, middle, last];

        installTransformedChildren(parent, children);

        expect(parent.children).toBe(children);
        expect(first.parent).toBe(parent);
        expect(first.prev).toBeNull();
        expect(first.next).toBe(middle);
        expect(middle.parent).toBe(parent);
        expect(middle.prev).toBe(first);
        expect(middle.next).toBe(last);
        expect(last.parent).toBe(parent);
        expect(last.prev).toBe(middle);
        expect(last.next).toBeNull();
    });

    it('serializes a collapsed editor child at a MathML integration point with paired tags', () => {
        selectFixture(`<div data-testid="editor"><math><mtext><div><span></span></div></mtext></math></div><span data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}="true">selected</span>`);

        expect(SelectionScraper.getCurrentSelection()).toBe('<div><math><mtext><span></span></mtext></math></div>');
    });

    it('preserves ordinary HTML transformations', () => {
        selectFixture(
            '<span data-testid="strong" class="discarded">bold &amp; <a href="https://example.com" class="discarded">link</a><br>\n</span>' +
                '<div data-testid="editor"><div><span>nested</span></div><span data-testid="email-with-break-opportunities">a\u200bb</span></div>',
        );

        expect(SelectionScraper.getCurrentSelection()).toBe('<strong>bold &amp; <a href="https://example.com">link</a><br></strong><div><span>nested</span><span>ab</span></div>');
    });
});
