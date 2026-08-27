import {getLinkColumnIndex, getRowLinkURL, getTextContent, isLinkColumnAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/TableRowLink';

import type {TNode} from 'react-native-render-html';

type FakeNode = {
    tagName?: string;
    data?: string;
    children: FakeNode[];
    parent?: FakeNode;
    attributes?: Record<string, string>;
};

/** Hands a fake to the code under test, which reads only tagName, data, children, parent and attributes. */
function asTNode(fakeNode: FakeNode | undefined): TNode {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields the helpers read
    return fakeNode as unknown as TNode;
}

function node(tagName: string, children: FakeNode[] = [], attributes: Record<string, string> = {}): FakeNode {
    const created: FakeNode = {tagName, children, attributes};
    for (const child of children) {
        child.parent = created;
    }
    return created;
}

function text(data: string): FakeNode {
    return {data, children: []};
}

function link(label: string, href: string): FakeNode {
    return node('a', [text(label)], {href});
}

/** A table whose body rows hold the given cells, e.g. `table([[link('Airbnb', url), text('£10')]])`. */
function table(rows: FakeNode[][]): FakeNode {
    const bodyRows = rows.map((cells) =>
        node(
            'tr',
            cells.map((cell) => node('td', [cell])),
        ),
    );
    return node('table', [node('thead', [node('tr', [node('th', [text('Merchant')]), node('th', [text('Amount')])])]), node('tbody', bodyRows)]);
}

function sectionOf(tableNode: FakeNode, tagName: string): FakeNode | undefined {
    return tableNode.children.find((child) => child.tagName === tagName);
}

function bodyRowAt(tableNode: FakeNode, index: number): FakeNode | undefined {
    return sectionOf(tableNode, 'tbody')?.children.at(index);
}

const AIRBNB_URL = 'https://new.expensify.com/r/8412';
const UBER_URL = 'https://new.expensify.com/r/8413';

describe('getLinkColumnIndex', () => {
    it('returns the column holding the links when every link sits in one column', () => {
        const expenseTable = table([
            [link('Airbnb', AIRBNB_URL), text('£404.60')],
            [link('Uber', UBER_URL), text('£15.93')],
        ]);

        expect(getLinkColumnIndex(asTNode(expenseTable))).toBe(0);
    });

    it('returns the column even when only some rows carry a link', () => {
        const expenseTable = table([
            [link('Airbnb', AIRBNB_URL), text('£404.60')],
            [text('Uber'), text('£15.93')],
        ]);

        expect(getLinkColumnIndex(asTNode(expenseTable))).toBe(0);
    });

    it('returns undefined for a table with no links', () => {
        const plainTable = table([[text('Airbnb'), text('£404.60')]]);

        expect(getLinkColumnIndex(asTNode(plainTable))).toBeUndefined();
    });

    it('returns undefined when links are spread across columns', () => {
        const mixedTable = table([[link('Airbnb', AIRBNB_URL), link('£404.60', UBER_URL)]]);

        expect(getLinkColumnIndex(asTNode(mixedTable))).toBeUndefined();
    });

    it('returns undefined when a cell holds more than one link, since one row destination cannot stand in for both', () => {
        const twoLinkCellTable = table([[node('span', [link('Airbnb', AIRBNB_URL), link('Uber', UBER_URL)]), text('£404.60')]]);

        expect(getLinkColumnIndex(asTNode(twoLinkCellTable))).toBeUndefined();
    });

    it('returns undefined when the linked cell holds an anchor with no href', () => {
        const anchorWithoutURLTable = table([[node('a', [text('Airbnb')]), text('£404.60')]]);

        expect(getLinkColumnIndex(asTNode(anchorWithoutURLTable))).toBeUndefined();
    });
});

describe('getRowLinkURL', () => {
    it('returns the href of the link column cell', () => {
        const expenseTable = table([
            [link('Airbnb', AIRBNB_URL), text('£404.60')],
            [link('Uber', UBER_URL), text('£15.93')],
        ]);

        expect(getRowLinkURL(asTNode(bodyRowAt(expenseTable, 0)), 0)).toBe(AIRBNB_URL);
        expect(getRowLinkURL(asTNode(bodyRowAt(expenseTable, 1)), 0)).toBe(UBER_URL);
    });

    it('returns undefined for a row with no link in that column', () => {
        const expenseTable = table([
            [link('Airbnb', AIRBNB_URL), text('£404.60')],
            [text('Uber'), text('£15.93')],
        ]);

        expect(getRowLinkURL(asTNode(bodyRowAt(expenseTable, 1)), 0)).toBeUndefined();
    });

    it('returns undefined when the table has no link column', () => {
        const expenseTable = table([[link('Airbnb', AIRBNB_URL), text('£404.60')]]);

        expect(getRowLinkURL(asTNode(bodyRowAt(expenseTable, 0)), undefined)).toBeUndefined();
    });

    it('returns undefined for a header row', () => {
        const expenseTable = table([[link('Airbnb', AIRBNB_URL), text('£404.60')]]);
        const headerRow = sectionOf(expenseTable, 'thead')?.children.at(0);

        expect(getRowLinkURL(asTNode(headerRow), 0)).toBeUndefined();
    });
});

describe('isLinkColumnAnchor', () => {
    it('recognizes an anchor nested below its cell, as the render tree wraps inline content', () => {
        const anchor = link('Airbnb', AIRBNB_URL);
        const row = node('tr', [node('td', [node('span', [anchor])]), node('td', [text('£404.60')])]);
        node('table', [node('tbody', [row])]);

        expect(isLinkColumnAnchor(asTNode(anchor), 0)).toBe(true);
    });

    it('leaves an anchor in another column alone', () => {
        const anchor = link('£404.60', UBER_URL);
        const row = node('tr', [node('td', [text('Airbnb')]), node('td', [anchor])]);
        node('table', [node('tbody', [row])]);

        expect(isLinkColumnAnchor(asTNode(anchor), 0)).toBe(false);
    });

    it('leaves an anchor outside a table alone', () => {
        const anchor = link('Insight', 'https://new.expensify.com/search?q=');
        node('div', [anchor]);

        expect(isLinkColumnAnchor(asTNode(anchor), 0)).toBe(false);
    });

    it('leaves a header anchor alone', () => {
        const anchor = link('Merchant', AIRBNB_URL);
        const headerRow = node('tr', [node('th', [anchor]), node('th', [text('Amount')])]);
        node('table', [node('thead', [headerRow])]);

        expect(isLinkColumnAnchor(asTNode(anchor), 0)).toBe(false);
    });
});

describe('getTextContent', () => {
    it('joins the text of every descendant', () => {
        expect(getTextContent(asTNode(node('td', [node('strong', [text('Amazon ')]), text('web services')])))).toBe('Amazon web services');
    });
});
