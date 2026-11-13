import {getPinnedColumnLayout, getPinnedColumns, setColumnPin} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

describe('getPinnedColumnLayout', () => {
    it('lays out left pins first and right pins last, each in pin order, keeping the rest in place', () => {
        // Given a table with pins on both edges, pinned out of their table order
        const columns = [
            CONST.SEARCH.TABLE_COLUMNS.TYPE,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            CONST.SEARCH.TABLE_COLUMNS.TAG,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ];

        // When the table is laid out
        const layout = getPinnedColumnLayout(columns, {
            left: [CONST.SEARCH.TABLE_COLUMNS.TAG, CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
            right: [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.CATEGORY],
        });

        // Then the pinned columns move to their edges in the order they were pinned
        expect(layout).toEqual({
            columns: [
                CONST.SEARCH.TABLE_COLUMNS.TAG,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                CONST.SEARCH.TABLE_COLUMNS.TYPE,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            ],
            leftPinned: [CONST.SEARCH.TABLE_COLUMNS.TAG, CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
            rightPinned: [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.CATEGORY],
        });
    });

    it('ignores pins on columns the table does not show', () => {
        // Given pins on columns hidden from the table
        const columns = [CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];

        // When the table is laid out
        const layout = getPinnedColumnLayout(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION, CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.TAG]});

        // Then only the shown pinned column moves, and no column appears that the table didn't show
        expect(layout).toEqual({
            columns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT],
            leftPinned: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
            rightPinned: [],
        });
    });

    it('returns the same columns array when nothing shown is pinned, so the table keeps its stable reference', () => {
        // Given a table whose only pin is on a hidden column
        const columns = [CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT];

        // When the table is laid out
        const layout = getPinnedColumnLayout(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.TAG], right: []});

        // Then the column order is the table's own
        expect(layout.columns).toBe(columns);
    });

    it('keeps the action column last, after the right pins', () => {
        // Given an expense report table, which ends with its action column
        const columns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.ACTION];

        // When a column is pinned right, and separately when only a column is pinned left
        const rightPinnedLayout = getPinnedColumnLayout(columns, {left: [], right: [CONST.SEARCH.TABLE_COLUMNS.DATE]});
        const leftPinnedLayout = getPinnedColumnLayout(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT], right: []});

        // Then the action column ends the row either way, and counts as part of the right edge only when that edge has pins
        expect(rightPinnedLayout).toEqual({
            columns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.ACTION],
            leftPinned: [],
            rightPinned: [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.ACTION],
        });
        expect(leftPinnedLayout).toEqual({
            columns: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.ACTION],
            leftPinned: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT],
            rightPinned: [],
        });
    });
});

describe('getPinnedColumns', () => {
    it('keeps a column named in both lists on the left only, and drops repeats', () => {
        // Given a hand-written query that pins Merchant to both edges and repeats Date
        const queryPins = {
            leftPinnedColumns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
            rightPinnedColumns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT],
        };

        // When the pins are read
        const pinnedColumns = getPinnedColumns(queryPins);

        // Then each column is pinned once, to the left when it was named there
        expect(pinnedColumns).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.DATE], right: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]});
    });

    it('reads a single pinned column the parser returns as a plain string', () => {
        // Given a query with one column pinned to each edge
        // When the pins are read
        const pinnedColumns = getPinnedColumns({leftPinnedColumns: CONST.SEARCH.TABLE_COLUMNS.MERCHANT, rightPinnedColumns: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT});

        // Then each edge holds that one column
        expect(pinnedColumns).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]});
    });
});

describe('setColumnPin', () => {
    it('appends a newly pinned column, moves a column pinned to the other edge, and unpins', () => {
        // Given Merchant pinned left and Total pinned right
        const pinnedColumns = {left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]};

        // When Date is pinned left, Merchant is pinned right, and Total is unpinned
        const withDate = setColumnPin(pinnedColumns, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT);
        const movedMerchant = setColumnPin(withDate, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT);
        const unpinnedTotal = setColumnPin(movedMerchant, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, undefined);

        // Then pins keep the order they were made in and a column never sits on both edges
        expect(withDate).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.DATE], right: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]});
        expect(movedMerchant).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.DATE], right: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MERCHANT]});
        expect(unpinnedTotal).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.DATE], right: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]});
    });
});
