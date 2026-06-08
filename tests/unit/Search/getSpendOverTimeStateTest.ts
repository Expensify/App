import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';
import {getSpendOverTimeState, SPEND_OVER_TIME_STATE} from '@pages/home/SpendOverTimeSection/useSpendOverTimeData';
import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

const queryJSON: SearchQueryJSON = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    view: CONST.SEARCH.VIEW.LINE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
} as SearchQueryJSON;

const makeSearchResults = (overrides: Partial<SearchResults> = {}): SearchResults =>
    ({
        search: {offset: 0, type: queryJSON.type, status: queryJSON.status, hasMoreResults: false, hasResults: true, isLoading: false},
        data: {},
        ...overrides,
    }) as SearchResults;

const makeData = (count: number): GroupedItem[] => Array.from({length: count}, (_, i) => ({keyForList: String(i)})) as unknown as GroupedItem[];

describe('getSpendOverTimeState', () => {
    it('returns OFFLINE when offline with no data', () => {
        expect(getSpendOverTimeState(true, undefined, queryJSON, undefined)).toBe(SPEND_OVER_TIME_STATE.OFFLINE);
    });

    it('returns READY when offline but cached data exists', () => {
        const results = makeSearchResults();
        expect(getSpendOverTimeState(true, results, queryJSON, makeData(3))).toBe(SPEND_OVER_TIME_STATE.READY);
    });

    it('returns ERROR when online and searchResults has errors', () => {
        const results = makeSearchResults({errors: {someError: 'Something went wrong'}});
        expect(getSpendOverTimeState(false, results, queryJSON, makeData(5))).toBe(SPEND_OVER_TIME_STATE.ERROR);
    });

    it('returns LOADING when data has not loaded yet', () => {
        expect(getSpendOverTimeState(false, undefined, queryJSON, undefined)).toBe(SPEND_OVER_TIME_STATE.LOADING);
    });

    it('returns HIDDEN when loaded but fewer than 2 data points', () => {
        const results = makeSearchResults();
        expect(getSpendOverTimeState(false, results, queryJSON, [])).toBe(SPEND_OVER_TIME_STATE.HIDDEN);
        expect(getSpendOverTimeState(false, results, queryJSON, makeData(1))).toBe(SPEND_OVER_TIME_STATE.HIDDEN);
    });

    it('returns READY when loaded with 2+ data points', () => {
        const results = makeSearchResults();
        expect(getSpendOverTimeState(false, results, queryJSON, makeData(2))).toBe(SPEND_OVER_TIME_STATE.READY);
        expect(getSpendOverTimeState(false, results, queryJSON, makeData(10))).toBe(SPEND_OVER_TIME_STATE.READY);
    });
});
