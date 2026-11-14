import {buildFilterFormValuesFromQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

describe('pinned columns in the search query', () => {
    it('parses both pin keys in their user-friendly and canonical spellings, keeping pin order', () => {
        // Given queries that pin columns using the dashed keys users type and the camelCase keys the app writes
        const userQuery = buildSearchQueryJSON('type:expense left-pinned-columns:merchant,date right-pinned-columns:tax-rate');
        const canonicalQuery = buildSearchQueryJSON('type:expense leftPinnedColumns:merchant,date rightPinnedColumns:taxrate');

        // When each is parsed
        // Then both read the pins the same way, in the order they were written, mapping column aliases like the `columns` key does
        for (const queryJSON of [userQuery, canonicalQuery]) {
            expect(queryJSON?.leftPinnedColumns).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.DATE]);
            expect(queryJSON?.rightPinnedColumns).toBe(CONST.SEARCH.TABLE_COLUMNS.TAX_RATE);
        }
    });

    it('survives a round trip from query string to JSON and back', () => {
        // Given a query with pins on both sides
        const queryJSON = buildSearchQueryJSON('type:expense columns:merchant,date,total left-pinned-columns:merchant right-pinned-columns:total,date');
        if (!queryJSON) {
            throw new Error('query did not parse');
        }

        // When it is written back out and parsed again, as navigating to it does
        const parsedAgain = buildSearchQueryJSON(buildSearchQueryString(queryJSON));

        // Then the pins come back unchanged, in pin order
        expect(parsedAgain?.leftPinnedColumns).toBe(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
        expect(parsedAgain?.rightPinnedColumns).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL, CONST.SEARCH.TABLE_COLUMNS.DATE]);
    });

    it('leaves the search hashes alone, so pinning never fetches the search again or forks its snapshot', () => {
        // Given the same search with and without pins
        const unpinned = buildSearchQueryJSON('type:expense columns:merchant,date,total');
        const pinned = buildSearchQueryJSON('type:expense columns:merchant,date,total left-pinned-columns:merchant right-pinned-columns:total');

        // When their hashes are compared
        // Then pins change none of them, since they only change how the table is laid out
        expect(pinned?.hash).toBe(unpinned?.hash);
        expect(pinned?.recentSearchHash).toBe(unpinned?.recentSearchHash);
        expect(pinned?.similarSearchHash).toBe(unpinned?.similarSearchHash);
    });

    it('carries pins through the filters form, dropping pins on columns the form no longer shows', () => {
        // Given a pinned query loaded into the filters form, as Edit columns and the filters page do
        const queryJSON = buildSearchQueryJSON('type:expense columns:merchant,date,total left-pinned-columns:merchant,date right-pinned-columns:total');
        if (!queryJSON) {
            throw new Error('query did not parse');
        }
        const formValues = buildFilterFormValuesFromQuery(queryJSON, undefined, {}, undefined, undefined, undefined, {});

        // When Date is taken off the table and the query is rebuilt from the form
        const queryString = buildQueryStringFromFilterFormValues({...formValues, columns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL]});
        const rebuilt = buildSearchQueryJSON(queryString);

        // Then Merchant and Total stay pinned, and Date stops being pinned along with being hidden
        expect(rebuilt?.leftPinnedColumns).toBe(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
        expect(rebuilt?.rightPinnedColumns).toBe(CONST.SEARCH.TABLE_COLUMNS.TOTAL);
    });
});
