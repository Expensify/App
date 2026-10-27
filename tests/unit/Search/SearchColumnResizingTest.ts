import {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';

import {getSearchColumnResizingID, getSearchTableRowChromeWidths, getSearchTableRowInsetWidth} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

describe('getSearchColumnResizingID', () => {
    it('stores every data type under its own ID', () => {
        // Given the data types whose tables show different columns
        const types = [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT];

        // When each one's ID is built
        const ids = types.map((type) => getSearchColumnResizingID(type, undefined));

        // Then no two share an entry, so resizing one table never overwrites another's widths
        expect(ids).toEqual(['search:expense', 'search:invoice', 'search:trip', 'search:expense-report']);
    });

    it('stores every group-by under its own ID, apart from the ungrouped table', () => {
        // Given the expense table ungrouped and grouped two ways
        const ungroupedID = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, undefined);
        const groupedByCategoryID = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.GROUP_BY.CATEGORY);
        const groupedByMonthID = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.GROUP_BY.MONTH);

        // Then each layout has its own entry, since grouping changes the columns
        expect(groupedByCategoryID).toBe('search:expense:category');
        expect(groupedByMonthID).toBe('search:expense:month');
        expect(new Set([ungroupedID, groupedByCategoryID, groupedByMonthID]).size).toBe(3);
    });

    it('files a group-by the table ignores under the ungrouped table', () => {
        // Given a query carrying a group-by value that isn't one Search groups by, which renders the ungrouped table
        const id = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, 'not-a-group-by');

        // Then it shares the ungrouped table's widths rather than starting a separate entry nothing else reads
        expect(id).toBe(getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, undefined));
    });
});

describe('getSearchTableRowChromeWidths', () => {
    it('leaves the resizable columns exactly the room the dynamic sizing and the scroller give them', () => {
        // Given a table of seven columns, 1200.6px wide
        const columnCount = 7;
        const tableWidth = 1200.6;

        // When the resize layout works out the room its columns share
        const availableColumnsWidth = getAvailableColumnsWidth(tableWidth, getSearchTableRowChromeWidths(columnCount));

        // Then it subtracts the same inset the rest of the Search table does, floored to whole px like the tracks
        expect(availableColumnsWidth).toBe(Math.floor(tableWidth - getSearchTableRowInsetWidth(columnCount)));
    });
});
