import {act, renderHook} from '@testing-library/react-native';

import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterFormValuesFromQuery, buildQueryStringWithResetFilters, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

const mockGetSearchKeyForQuery = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryActions: () => ({getSearchKeyForQuery: mockGetSearchKeyForQuery}),
}));

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

const baseQueryJSON: SearchQueryJSON = {
    hash: 0,
    recentSearchHash: 0,
    similarSearchHash: 0,
    groupBy: undefined,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    flatFilters: [],
    inputQuery: '',
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS, right: ''},
    columns: undefined,
    limit: undefined,
    rawFilterList: undefined,
};

/** The params of the single `Navigation.setParams` call made by `setFilterQueryParams`. */
function getSetParamsCall() {
    expect(Navigation.setParams).toHaveBeenCalledTimes(1);
    const [params] = jest.mocked(Navigation.setParams).mock.calls.at(0) ?? [];
    return params ?? {};
}

describe('useUpdateFilterQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE} satisfies Partial<SearchAdvancedFiltersForm>;
        mockGetSearchKeyForQuery.mockReset();
        mockGetSearchKeyForQuery.mockReturnValue(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        jest.mocked(Navigation.setParams).mockClear();
    });

    describe('setFilterQueryParams', () => {
        it('writes the re-derived search key to the route when the type changes', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(mockGetSearchKeyForQuery).toHaveBeenCalledWith(expect.objectContaining({type: CONST.SEARCH.DATA_TYPES.INVOICE}));
            expect(getSetParamsCall()).toEqual(expect.objectContaining({searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS}));
        });

        it('clears the search key when the new query matches no search', () => {
            mockGetSearchKeyForQuery.mockReturnValue(undefined);
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(getSetParamsCall()).toHaveProperty('searchKey', undefined);
        });

        it('leaves the search key param alone when the type is set to the one the form already holds', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });

        it('leaves the search key param alone when the type is unchanged', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });

        it('leaves the search key param alone when no type is provided', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({merchant: 'Amazon'});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });
    });

    function setup() {
        const queryJSON = buildSearchQueryJSON('merchant=I merchant*:I');
        if (!queryJSON) {
            throw new Error('Invalid test query');
        }

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {});
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = form;

        return {...renderHook(() => useUpdateFilterQuery(queryJSON)), form, queryJSON};
    }

    function getNavigatedQuery() {
        const [params] = jest.mocked(Navigation.setParams).mock.calls.at(-1) ?? [];
        if (!params || !('q' in params) || typeof params.q !== 'string') {
            throw new Error('Expected navigation to a search query');
        }

        return buildSearchQueryJSON(params.q);
    }

    test.each(['updateFilterQueryParams', 'setFilterQueryParams'] as const)('retains mixed Merchant predicates through %s', (method) => {
        const {result, form, queryJSON} = setup();
        const updates: Partial<SearchAdvancedFiltersForm> = {currency: ['VND']};

        act(() => {
            result.current[method](method === 'setFilterQueryParams' ? {...form, ...updates} : updates);
        });

        expect(getNavigatedQuery()?.flatFilters.filter((filter) => filter.key === 'merchant')).toEqual(queryJSON.flatFilters);
        expect(getNavigatedQuery()?.flatFilters).toContainEqual({key: 'currency', filters: [{operator: 'eq', value: 'VND'}]});
    });

    test('removes all positive Merchant predicates when clearing the Merchant chip', () => {
        const {result} = setup();

        act(() => {
            result.current.updateFilterQueryParams({merchant: undefined});
        });

        expect(getNavigatedQuery()?.flatFilters).toEqual([]);
    });

    test('removes Merchant predicates when resetting without a default search', () => {
        const {queryJSON} = setup();
        const resetQuery = buildSearchQueryJSON(buildQueryStringWithResetFilters(queryJSON, undefined));

        expect(resetQuery?.flatFilters).toEqual([]);
    });

    test('restores default Merchant predicates when resetting filters', () => {
        const {queryJSON} = setup();
        const defaultQuery = buildSearchQueryJSON('merchant*:Amazon,Uber');
        if (!defaultQuery) {
            throw new Error('Invalid default query');
        }
        const resetQuery = buildSearchQueryJSON(buildQueryStringWithResetFilters(queryJSON, defaultQuery));

        expect(resetQuery?.flatFilters).toEqual(defaultQuery.flatFilters);
    });
});
