import {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';

import {getSearchColumnResizingID, getSearchTableRowChromeWidths, getSearchTableRowInsetWidth} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

describe('getSearchColumnResizingID', () => {
    it('stores every data type under its own ID', () => {
        // Given the data types whose tables show different columns
        const types = [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT];

        // When each one's ID is built
        const ids = types.map((type) => getSearchColumnResizingID(type));

        // Then no two share an entry, so resizing one table never overwrites another's widths
        expect(ids).toEqual(['search:expense', 'search:invoice', 'search:trip', 'search:expense-report']);
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
