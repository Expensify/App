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

const mockResetSearchKey = jest.fn();
const mockUseSearchQueryContext = jest.fn<{currentSearchHash: number}, []>();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryActions: () => ({resetSearchKey: mockResetSearchKey}),
    useSearchQueryContext: () => mockUseSearchQueryContext(),
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

describe('useUpdateFilterQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE} satisfies Partial<SearchAdvancedFiltersForm>;
        mockUseSearchQueryContext.mockReturnValue({currentSearchHash: -1});
    });

    describe('setFilterQueryParams', () => {
        it('resets the search key when the type changes', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(mockResetSearchKey).toHaveBeenCalledTimes(1);
            expect(mockResetSearchKey).toHaveBeenCalledWith(expect.objectContaining({type: CONST.SEARCH.DATA_TYPES.INVOICE}));
        });

        it('does not reset the search key when the new query is the current query', () => {
            mockUseSearchQueryContext.mockReturnValue({currentSearchHash: baseQueryJSON.hash});
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE});

            expect(mockResetSearchKey).not.toHaveBeenCalled();
        });

        it('does not reset the search key when the type is unchanged', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});

            expect(mockResetSearchKey).not.toHaveBeenCalled();
        });

        it('does not reset the search key when no type is provided', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            result.current.setFilterQueryParams({merchant: 'Amazon'});

            expect(mockResetSearchKey).not.toHaveBeenCalled();
        });
    });

    function setup() {
        const queryJSON = buildSearchQueryJSON('merchant=I merchant*:I');
        if (!queryJSON) {
            throw new Error('Invalid test query');
        }

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {}, {});
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
