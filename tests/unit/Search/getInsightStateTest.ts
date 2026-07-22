import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import {getInsightState, INSIGHT_STATE} from '@pages/home/InsightsSection/useInsightData';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

const queryJSON: SearchQueryJSON = {
    inputQuery: '',
    hash: 0,
    recentSearchHash: 0,
    similarSearchHash: 0,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    view: CONST.SEARCH.VIEW.LINE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    flatFilters: [],
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE, right: CONST.SEARCH.DATA_TYPES.EXPENSE},
};

const defaultSearchResults: SearchResults = {
    search: {offset: 0, hash: 0, type: queryJSON.type, hasMoreResults: false, hasResults: true, isLoading: false},
    data: {},
};

const makeSearchResults = (overrides: Partial<SearchResults> = {}): SearchResults => ({
    ...defaultSearchResults,
    ...overrides,
    search: overrides.search ?? defaultSearchResults.search,
    data: overrides.data ?? defaultSearchResults.data,
});

const makeData = (count: number): GroupedItem[] =>
    Array.from({length: count}, (_, i) => ({
        keyForList: String(i),
        transactions: [],
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year: 2026,
        month: i + 1,
        count: 1,
        total: 0,
        currency: CONST.CURRENCY.USD,
        formattedMonth: `Month ${i + 1}`,
        sortKey: i,
    }));

describe('getInsightState', () => {
    it('returns OFFLINE when offline with no data', () => {
        expect(getInsightState(true, undefined, queryJSON, undefined)).toBe(INSIGHT_STATE.OFFLINE);
    });

    it('returns READY when offline but cached data exists', () => {
        const results = makeSearchResults();
        expect(getInsightState(true, results, queryJSON, makeData(3))).toBe(INSIGHT_STATE.READY);
    });

    it('returns ERROR when online and searchResults has errors', () => {
        const results = makeSearchResults({errors: {someError: 'Something went wrong'}});
        expect(getInsightState(false, results, queryJSON, makeData(5))).toBe(INSIGHT_STATE.ERROR);
    });

    it('returns LOADING when data has not loaded yet', () => {
        expect(getInsightState(false, undefined, queryJSON, undefined)).toBe(INSIGHT_STATE.LOADING);
    });

    it('returns HIDDEN when loaded but there are no data points', () => {
        const results = makeSearchResults();
        expect(getInsightState(false, results, queryJSON, [])).toBe(INSIGHT_STATE.HIDDEN);
        expect(getInsightState(false, results, queryJSON, undefined)).toBe(INSIGHT_STATE.HIDDEN);
    });

    it('returns HIDDEN when loaded with a single data point', () => {
        const results = makeSearchResults();
        expect(getInsightState(false, results, queryJSON, makeData(1))).toBe(INSIGHT_STATE.HIDDEN);
    });

    it('returns READY when loaded with with 2+ data points', () => {
        const results = makeSearchResults();
        expect(getInsightState(false, results, queryJSON, makeData(2))).toBe(INSIGHT_STATE.READY);
        expect(getInsightState(false, results, queryJSON, makeData(10))).toBe(INSIGHT_STATE.READY);
    });
});
