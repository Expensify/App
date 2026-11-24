import type {GroupedItem} from '@components/Search/types';

import {buildExclusionsFilterQuery, getExcludedItemKeys, getExclusionItemKey, getExclusionsSearchKey, removeExcludedItems} from '@pages/Insights/insightsExclusions';

import CONST from '@src/CONST';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the exclusion key reads are needed
const spender = (accountID: number) => ({groupedBy: CONST.SEARCH.GROUP_BY.FROM, accountID, keyForList: String(accountID)}) as GroupedItem;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the exclusion key reads are needed
const merchant = (name: string) => ({groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: name, keyForList: name}) as GroupedItem;

describe('insightsExclusions', () => {
    it('reads the saved exclusions of one chart only', () => {
        // Given exclusions saved for Top spenders and for Violations by submitter
        const searchFilters = {
            [getExclusionsSearchKey(CONST.INSIGHTS.GRAPH.TOP_SPENDERS)]: {query: '["1","2"]', timestamp: ''},
            [getExclusionsSearchKey(CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER)]: {query: '["3"]', timestamp: ''},
        };

        // When Top spenders reads its exclusions
        const keys = getExcludedItemKeys(searchFilters, CONST.INSIGHTS.GRAPH.TOP_SPENDERS);

        // Then it gets its own list, since each chart keeps a separate one
        expect(keys).toEqual(['1', '2']);
    });

    it('treats a missing or unreadable entry as nothing excluded', () => {
        // Given a chart with no saved entry and a chart whose entry isn't a JSON list
        const searchFilters = {[getExclusionsSearchKey(CONST.INSIGHTS.GRAPH.TOP_MERCHANTS)]: {query: 'not json', timestamp: ''}};

        // When both read their exclusions
        // Then neither excludes anything, so a bad value never hides data
        expect(getExcludedItemKeys(searchFilters, CONST.INSIGHTS.GRAPH.TOP_SPENDERS)).toEqual([]);
        expect(getExcludedItemKeys(searchFilters, CONST.INSIGHTS.GRAPH.TOP_MERCHANTS)).toEqual([]);
    });

    it('keys people by account ID and merchants by name', () => {
        // Given a spender and a merchant row
        // When their exclusion keys are read
        // Then a person is keyed by an ID that survives a name change, and a merchant by its name
        expect(getExclusionItemKey(spender(42))).toBe('42');
        expect(getExclusionItemKey(merchant('Delta Air Lines'))).toBe('Delta Air Lines');
    });

    it('leaves out excluded items before the chart caps its rows', () => {
        // Given four ranked spenders with the top one excluded
        const items = [spender(1), spender(2), spender(3), spender(4)];

        // When the excluded items are removed
        const remaining = removeExcludedItems(items, ['1', '99']);

        // Then the rest keep their order, and a key with no matching row is ignored
        expect(remaining?.map(getExclusionItemKey)).toEqual(['2', '3', '4']);
    });

    it('negates the excluded items on the filter the chart groups by', () => {
        // Given excluded spenders and an excluded merchant whose name has a space
        // When the Spend query fragments are built
        // Then each one uses the chart's own filter with the "is not" prefix, quoting values that need it
        expect(buildExclusionsFilterQuery(CONST.SEARCH.GROUP_BY.FROM, ['1', '2'])).toBe('-from:1,2');
        expect(buildExclusionsFilterQuery(CONST.SEARCH.GROUP_BY.MERCHANT, ['Delta Air Lines'])).toBe('-merchant:"Delta Air Lines"');
        expect(buildExclusionsFilterQuery(CONST.SEARCH.GROUP_BY.FROM, [])).toBe('');
    });
});
