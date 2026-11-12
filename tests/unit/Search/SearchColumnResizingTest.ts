import {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';

import {getSearchColumnResizingID, savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getSearchTableRowChromeWidths, getSearchTableRowInsetWidth} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

describe('getSearchColumnResizingID', () => {
    it('stores every search under its own ID', () => {
        // Given the Expenses and Reports suggested searches, a to-do search, and a saved search
        const searches = [
            {type: CONST.SEARCH.DATA_TYPES.EXPENSE, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES},
            {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS},
            {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE},
            {type: CONST.SEARCH.DATA_TYPES.EXPENSE, searchKey: savedSearchIDToSearchKey('123')},
        ];

        // When each one's ID is built
        const ids = searches.map(({type, searchKey}) => getSearchColumnResizingID(type, searchKey));

        // Then no two share an entry, so resizing one search never changes another's widths
        expect(ids).toEqual(['search:expense:expenses', 'search:expense-report:reports', 'search:expense-report:approve', 'search:expense:savedSearch_123']);
    });

    it('keeps a search edited to another data type apart from its original columns', () => {
        // Given a saved search that was edited from expenses to reports
        const searchKey = savedSearchIDToSearchKey('123');

        // When the ID is built for each type
        const expenseID = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE, searchKey);
        const reportID = getSearchColumnResizingID(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, searchKey);

        // Then the report columns don't replay widths saved for the expense columns
        expect(expenseID).not.toBe(reportID);
    });

    it('falls back to one ID per data type when no search matches the query', () => {
        // Given queries that match no suggested or saved search
        const types = [CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TASK];

        // When each one's ID is built
        const ids = types.map((type) => getSearchColumnResizingID(type, undefined));

        // Then they share their data type's layout
        expect(ids).toEqual(['search:invoice', 'search:task']);
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
