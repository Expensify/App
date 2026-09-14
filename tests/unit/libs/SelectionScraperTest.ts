import SelectionScraper from '@libs/SelectionScraper/index.ts';

import CONST from '@src/CONST';

const HIDDEN_ATTR = `data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}`;

function selectNodeContents(node: Node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

describe('SelectionScraper', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.getSelection()?.removeAllRanges();
    });

    it('strips copied content when the row wrapper carries the selection-scraper hidden marker', () => {
        document.body.innerHTML = `
            <div ${HIDDEN_ATTR}="true">
                <div data-testid="text-fragment">first</div>
            </div>
            <div ${HIDDEN_ATTR}="true">
                <div data-testid="text-fragment">second</div>
            </div>
        `;

        const first = document.querySelector(`div[${HIDDEN_ATTR}] div`) as HTMLElement;
        const second = document.querySelectorAll(`div[${HIDDEN_ATTR}] div`)[1] as HTMLElement;
        const range = document.createRange();
        range.setStart(first.firstChild as Text, 0);
        range.setEnd(second.firstChild as Text, (second.firstChild as Text).length);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);

        expect(window.getSelection()?.toString()).toContain('first');
        expect(window.getSelection()?.toString()).toContain('second');
        expect(SelectionScraper.getCurrentSelection().trim()).toBe('');
        expect(SelectionScraper.getCurrentSelection()).not.toContain('first');
        expect(SelectionScraper.getCurrentSelection()).not.toContain('second');
    });

    it('preserves copied content when the row wrapper is not marked hidden', () => {
        document.body.innerHTML = `
            <div>
                <div data-testid="text-fragment">hello</div>
            </div>
        `;
        selectNodeContents(document.querySelector('[data-testid="text-fragment"]') as HTMLElement);

        const selection = SelectionScraper.getCurrentSelection();
        expect(selection).toContain('hello');
    });

    it('normalizes button tags to div in the rendered clipboard HTML', () => {
        document.body.innerHTML = `
            <div>
                <button>
                    <div data-testid="text-fragment">hello</div>
                </button>
            </div>
        `;
        selectNodeContents(document.querySelector('[data-testid="text-fragment"]') as HTMLElement);

        const selection = SelectionScraper.getCurrentSelection();
        expect(selection).toContain('hello');
        expect(selection).not.toContain('<button');
        expect(selection).toContain('<div');
    });
});
