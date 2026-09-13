import type SelectionScraperModule from '../../src/libs/SelectionScraper/index';

import CONST from '../../src/CONST';

const SelectionScraper = jest.requireActual<{default: typeof SelectionScraperModule}>('../../src/libs/SelectionScraper/index.ts').default;
const copyableRowAttribute = `data-${CONST.COPYABLE_ROW_ELEMENT}`;
const copyableTextAttribute = `data-${CONST.COPYABLE_TEXT_ELEMENT}`;
const hiddenElementAttribute = `data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}`;

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
    beforeEach(() => {
        document.body.innerHTML = '';
        window.getSelection()?.removeAllRanges();
    });

    it('formats selected copyable cells as one line per row', () => {
        document.body.innerHTML = `
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
        `;

        selectText(getTextNode('date1'), 0, getTextNode('status2'), 'Draft'.length);

        expect(SelectionScraper.getCurrentSelection()).toBe('Aug 26 Paid<br>Aug 27 Draft');
    });

    it('keeps browser selection behavior for a single selected copyable cell', () => {
        document.body.innerHTML = `
            <div ${copyableRowAttribute}="true">
                <span id="amount" ${copyableTextAttribute}="true">$123.45</span>
            </div>
        `;

        selectText(getTextNode('amount'), 1, getTextNode('amount'), 4);

        expect(SelectionScraper.getCurrentSelection()).toBe('123');
    });

    it('preserves partial first and last cell boundaries in multi-row selections', () => {
        document.body.innerHTML = `
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
        `;

        selectText(getTextNode('date1'), 'Aug '.length, getTextNode('title2'), 'Expense'.length);

        expect(SelectionScraper.getCurrentSelection()).toBe('26 Paid Expense Report<br>Aug 27 Draft Expense');
    });

    it('falls back to regular scraping when selected text extends outside copyable rows', () => {
        document.body.innerHTML = `
            <div>
                <div ${copyableRowAttribute}="true">
                    <span id="amount" ${copyableTextAttribute}="true">$40.00</span>
                    <span id="merchant" ${copyableTextAttribute}="true">APPLE TEST</span>
                </div>
                <p id="comment">submitted a comment</p>
            </div>
        `;

        selectText(getTextNode('amount'), 0, getTextNode('comment'), 'submitted a comment'.length);

        const selectionHTML = SelectionScraper.getCurrentSelection();
        expect(selectionHTML).toContain('$40.00');
        expect(selectionHTML).toContain('APPLE TEST');
        expect(selectionHTML).toContain('submitted a comment');
        expect(selectionHTML).not.toBe('$40.00 APPLE TEST');
    });
});
