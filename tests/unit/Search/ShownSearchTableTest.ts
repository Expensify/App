import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {canEditShownSearchTable, hasSameSearchResults} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Unparseable query: ${query}`);
    }
    return queryJSON;
}

const EXPENSE_QUERY = 'type:expense';
const MONTH_TABLE_QUERY = `type:expense group-by:${CONST.SEARCH.GROUP_BY.MONTH} view:${CONST.SEARCH.VIEW.TABLE}`;

describe('canEditShownSearchTable', () => {
    it('lets the table on screen edit its columns when it shows the search the user is on', () => {
        // Given the same expense search on screen and in the URL, as when nothing is loading
        const queryJSON = getQueryJSON(EXPENSE_QUERY);

        // When the table checks whether its column actions apply
        // Then they do, so the column menu and sorting work as usual
        expect(canEditShownSearchTable(queryJSON, queryJSON)).toBe(true);
    });

    it('lets the table on screen edit its columns while a new filter loads', () => {
        // Given an expense search on screen while the same search with a Draft filter loads
        const shownQueryJSON = getQueryJSON(EXPENSE_QUERY);
        const currentSearchQueryJSON = getQueryJSON(`${EXPENSE_QUERY} status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS}`);

        // When the table checks whether its column actions apply
        // Then they do, because a filter keeps the same columns and sorts, and the actions build on the search with the filter
        expect(canEditShownSearchTable(shownQueryJSON, currentSearchQueryJSON)).toBe(true);
    });

    it('stops the table on screen from editing its columns while a search of another type loads', () => {
        // Given an expense search on screen while a report search loads
        const shownQueryJSON = getQueryJSON(EXPENSE_QUERY);
        const currentSearchQueryJSON = getQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}`);

        // When the table checks whether its column actions apply
        // Then they don't, because the report table has other columns than the expense table on screen
        expect(canEditShownSearchTable(shownQueryJSON, currentSearchQueryJSON)).toBe(false);
    });

    it('stops the table on screen from editing its columns while a grouped search loads', () => {
        // Given an ungrouped expense search on screen while the same search grouped by category loads
        const shownQueryJSON = getQueryJSON(EXPENSE_QUERY);
        const currentSearchQueryJSON = getQueryJSON(`${EXPENSE_QUERY} group-by:${CONST.SEARCH.GROUP_BY.CATEGORY}`);

        // When the table checks whether its column actions apply
        // Then they don't, because a sort by an expense column doesn't apply to a table of categories
        expect(canEditShownSearchTable(shownQueryJSON, currentSearchQueryJSON)).toBe(false);
    });

    it('stops the table on screen from editing its columns while the same grouping in another view loads', () => {
        // Given a month-grouped table on screen while the same search as a line chart loads
        const shownQueryJSON = getQueryJSON(MONTH_TABLE_QUERY);
        const currentSearchQueryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.MONTH} view:${CONST.SEARCH.VIEW.LINE}`);

        // When the table checks whether its column actions apply
        // Then they don't, because switching to a line chart resets the sort so time runs forward, and a sort from the table would undo that
        expect(canEditShownSearchTable(shownQueryJSON, currentSearchQueryJSON)).toBe(false);
    });
});

describe('hasSameSearchResults', () => {
    it('treats a search that only changed its pins as showing the same results', () => {
        // Given an expense search on screen while the same search with Merchant pinned is in the URL
        const shownQueryJSON = getQueryJSON(EXPENSE_QUERY);
        const currentSearchQueryJSON = getQueryJSON(`${EXPENSE_QUERY} ${CONST.SEARCH.SYNTAX_ROOT_KEYS.LEFT_PINNED_COLUMNS}:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT}`);

        // When the page checks whether the results on screen belong to the search the user is on
        // Then they do, because pins only reorder the columns, so the chart on screen can still be drilled into
        expect(hasSameSearchResults(shownQueryJSON, currentSearchQueryJSON)).toBe(true);
    });

    it('treats the results on screen as outdated while a new filter loads', () => {
        // Given a category chart on screen while the same chart with a Draft filter loads
        const shownQueryJSON = getQueryJSON(`${EXPENSE_QUERY} group-by:${CONST.SEARCH.GROUP_BY.CATEGORY} view:${CONST.SEARCH.VIEW.BAR}`);
        const currentSearchQueryJSON = getQueryJSON(`${EXPENSE_QUERY} group-by:${CONST.SEARCH.GROUP_BY.CATEGORY} view:${CONST.SEARCH.VIEW.BAR} status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS}`);

        // When the page checks whether the results on screen belong to the search the user is on
        // Then they don't, so the chart on screen can't be drilled into until the filtered results arrive
        expect(hasSameSearchResults(shownQueryJSON, currentSearchQueryJSON)).toBe(false);
    });
});
