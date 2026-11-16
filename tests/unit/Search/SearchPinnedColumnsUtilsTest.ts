import {getPinnedColumnOrder, getPinnedColumns, getPinsOnSavedColumns, setColumnPin} from '@libs/SearchPinnedColumnsUtils';

import CONST from '@src/CONST';

describe('getPinnedColumnOrder', () => {
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
        const layout = getPinnedColumnOrder(columns, {
            left: [CONST.SEARCH.TABLE_COLUMNS.TAG, CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
            right: [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.CATEGORY],
        });

        // Then the pinned columns move to their edges in the order they were pinned
        expect(layout).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.TAG,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.TYPE,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        ]);
    });

    it('ignores pins on columns the table does not show', () => {
        // Given pins on columns hidden from the table
        const columns = [CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];

        // When the table is laid out
        const layout = getPinnedColumnOrder(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION, CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.TAG]});

        // Then only the shown pinned column moves, and no column appears that the table didn't show
        expect(layout).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it("keeps the table's own order when nothing shown is pinned", () => {
        // Given a table whose only pin is on a hidden column
        const columns = [CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT];

        // When the table is laid out
        const layout = getPinnedColumnOrder(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.TAG], right: []});

        // Then the column order is the table's own
        expect(layout).toEqual(columns);
    });

    it('keeps the action column last, after the right pins', () => {
        // Given an expense report table, which ends with its action column
        const columns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.ACTION];

        // When a column is pinned right, and separately when only a column is pinned left
        const rightPinnedLayout = getPinnedColumnOrder(columns, {left: [], right: [CONST.SEARCH.TABLE_COLUMNS.DATE]});
        const leftPinnedLayout = getPinnedColumnOrder(columns, {left: [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT], right: []});

        // Then the action column ends the row either way
        expect(rightPinnedLayout).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.ACTION]);
        expect(leftPinnedLayout).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.ACTION]);
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

describe('getPinsOnSavedColumns', () => {
    it('drops pins on columns the query no longer saves', () => {
        // Given Merchant and Date pinned, and a query that now saves only Merchant and Total
        const pinnedColumns = {left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.DATE]};

        // When the pins are matched to the saved columns
        const kept = getPinsOnSavedColumns(pinnedColumns, [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL]);

        // Then Date stops being pinned, so adding it back later doesn't pin it again
        expect(kept).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: []});
    });

    it('keeps every pin when the query saves no columns, since the table then shows its defaults', () => {
        // Given pins on a query that leaves the columns to the table
        const pinnedColumns = {left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: [CONST.SEARCH.TABLE_COLUMNS.DATE]};

        // When the pins are matched to no saved columns
        const kept = getPinsOnSavedColumns(pinnedColumns, undefined);

        // Then the pins stay, because the default columns those pins sit on aren't known here
        expect(kept).toEqual(pinnedColumns);
    });
});
