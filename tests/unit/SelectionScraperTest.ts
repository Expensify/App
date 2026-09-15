import type * as SelectionScraperWebModule from '@libs/SelectionScraper/index';
import installTransformedChildren from '@libs/SelectionScraper/installTransformedChildren';

import CONST from '@src/CONST';

import {Element, Text} from 'domhandler';

// cspell:ignore mtext
// Selection scraping only exists in the web implementation. The native variant always returns an empty string.
const {default: SelectionScraper} = jest.requireActual<typeof SelectionScraperWebModule>('@libs/SelectionScraper/index.ts');

const copyableRowAttribute = `data-${CONST.COPYABLE_ROW_ELEMENT}`;
const copyableTextAttribute = `data-${CONST.COPYABLE_TEXT_ELEMENT}`;
const hiddenElementAttribute = `data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}`;
const fixtures: HTMLElement[] = [];

function createFixture(html: string): HTMLElement {
    const fixture = document.createElement('div');
    fixture.innerHTML = html;
    document.body.append(fixture);
    fixtures.push(fixture);
    return fixture;
}

function selectFixture(html: string) {
    const fixture = createFixture(html);
    const range = document.createRange();
    range.selectNodeContents(fixture);
    const selection = window.getSelection();
    if (!selection) {
        throw new Error('Selection API is unavailable');
    }
    selection.removeAllRanges();
    selection.addRange(range);
}

function getTextNode(id: string): ChildNode {
    const element = document.getElementById(id);
    if (!element?.firstChild) {
        throw new Error(`Missing text node for ${id}`);
    }

    return element.firstChild;
}

function selectText(startNode: Node, startOffset: number, endNode: Node, endOffset: number) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    selection?.removeAllRanges();
    selection?.addRange(range);
}

describe('SelectionScraper', () => {
    afterEach(() => {
        window.getSelection()?.removeAllRanges();
        for (const fixture of fixtures) {
            fixture.remove();
        }
        fixtures.length = 0;
    });

    it('formats selected copyable cells as one line per row', () => {
        createFixture(`
            <div>
                <div ${copyableRowAttribute}="true">
                    <span id="date1" ${copyableTextAttribute}="true">Aug 26</span>
                    <span id="status1" ${copyableTextAttribute}="true">Paid</span>
                    <span ${hiddenElementAttribute}="true">T</span>
                </div>
                <div ${copyableRowAttribute}="true">
                    <span id="date2" ${copyableTextAttribute}="true">Aug 27</span>
                    <span id="status2" ${copyableTextAttribute}="true">Draft</span>
                </div>
            </div>
        `);

        selectText(getTextNode('date1'), 0, getTextNode('status2'), 'Draft'.length);

        expect(SelectionScraper.getCurrentSelection()).toBe('Aug 26 Paid<br>Aug 27 Draft');
    });

    it('keeps browser selection behavior for a single selected copyable cell', () => {
        createFixture(`
            <div ${copyableRowAttribute}="true">
                <span id="amount" ${copyableTextAttribute}="true">$123.45</span>
            </div>
        `);

        selectText(getTextNode('amount'), 1, getTextNode('amount'), 4);

        expect(SelectionScraper.getCurrentSelection()).toBe('123');
    });

    it('preserves partial first and last cell boundaries in multi-row selections', () => {
        createFixture(`
            <div>
                <div ${copyableRowAttribute}="true">
                    <span id="date1" ${copyableTextAttribute}="true">Aug 26</span>
                    <span id="status1" ${copyableTextAttribute}="true">Paid</span>
                    <span id="title1" ${copyableTextAttribute}="true">Expense Report</span>
                </div>
                <div ${copyableRowAttribute}="true">
                    <span id="date2" ${copyableTextAttribute}="true">Aug 27</span>
                    <span id="status2" ${copyableTextAttribute}="true">Draft</span>
                    <span id="title2" ${copyableTextAttribute}="true">Expense Report</span>
                </div>
            </div>
        `);

        selectText(getTextNode('date1'), 'Aug '.length, getTextNode('title2'), 'Expense'.length);

        expect(SelectionScraper.getCurrentSelection()).toBe('26 Paid Expense Report<br>Aug 27 Draft Expense');
    });

    it('falls back to regular scraping when selected text extends outside copyable rows', () => {
        createFixture(`
            <div>
                <div ${copyableRowAttribute}="true">
                    <span id="amount" ${copyableTextAttribute}="true">$40.00</span>
                    <span id="merchant" ${copyableTextAttribute}="true">APPLE TEST</span>
                </div>
                <p id="comment">submitted a comment</p>
            </div>
        `);

        selectText(getTextNode('amount'), 0, getTextNode('comment'), 'submitted a comment'.length);

        const selectionHTML = SelectionScraper.getCurrentSelection();
        expect(selectionHTML).toContain('$40.00');
        expect(selectionHTML).toContain('APPLE TEST');
        expect(selectionHTML).toContain('submitted a comment');
        expect(selectionHTML).not.toBe('$40.00 APPLE TEST');
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

        expect(parent.children).toEqual(children);
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
