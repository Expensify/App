import {renderHook} from '@testing-library/react-native';

import useSearchFiltersBar from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import type {SearchQueryJSON} from '@components/Search/types';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetFilters} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

const mockSetFilterQueryParams = jest.fn();
const mockUpdateFilterQueryParams = jest.fn();
const mockUseSearchResultsContext = jest.fn<Record<string, unknown>, []>();
const mockUseSearchQueryContext = jest.fn<Record<string, unknown>, []>();
const mockMapFiltersFormToLabelValueList = jest.fn<unknown[], unknown[]>();

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({setFilterQueryParams: mockSetFilterQueryParams, updateFilterQueryParams: mockUpdateFilterQueryParams}),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    mapFiltersFormToLabelValueList: (...args: unknown[]) => mockMapFiltersFormToLabelValueList(...args),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => mockUseSearchResultsContext(),
    useSearchQueryContext: () => mockUseSearchQueryContext(),
}));

jest.mock('@libs/actions/Search');
jest.mock('@libs/Navigation/Navigation');

const queryJSON: SearchQueryJSON = {
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

function mockSearchResultsContext(overrides: Record<string, unknown> = {}) {
    mockUseSearchResultsContext.mockReturnValue({shouldShowFiltersBarLoading: false, currentSearchResults: undefined, ...overrides});
}

function mockSearchQueryContext(overrides: Record<string, unknown> = {}) {
    mockUseSearchQueryContext.mockReturnValue({
        currentDefaultSearchQueryFilterKeys: [],
        currentSearchQueryJSON: undefined,
        currentDefaultSearchQueryJSON: undefined,
        ...overrides,
    });
}

function buildQueryJSON(flatFilters: SearchQueryJSON['flatFilters']): SearchQueryJSON {
    return {...queryJSON, flatFilters};
}

const merchantFilters: SearchQueryJSON['flatFilters'] = [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Uber'}]}];
const categoryFilters: SearchQueryJSON['flatFilters'] = [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Travel'}]}];

describe('useSearchFiltersBar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchResultsContext();
        mockSearchQueryContext();
        mockMapFiltersFormToLabelValueList.mockReturnValue([]);
    });

    describe('shouldShowResetFilters', () => {
        it('is true when the default query filters differ from the current query filters', () => {
            mockSearchQueryContext({
                currentDefaultSearchQueryJSON: buildQueryJSON(merchantFilters),
                currentSearchQueryJSON: buildQueryJSON(categoryFilters),
            });

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when the default query filters equal the current query filters', () => {
            mockSearchQueryContext({
                currentDefaultSearchQueryJSON: buildQueryJSON(merchantFilters),
                currentSearchQueryJSON: buildQueryJSON(merchantFilters),
            });

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('falls back to having filters when there is no default query JSON', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([{key: 'merchant'}]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when there is no default query JSON and no filters', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(false);
        });
    });

    describe('resetFilters', () => {
        it('navigates to the query the filters reset to', () => {
            const currentSearchQueryJSON = buildQueryJSON(categoryFilters);
            const currentDefaultSearchQueryJSON = buildQueryJSON(merchantFilters);
            mockSearchQueryContext({currentSearchQueryJSON, currentDefaultSearchQueryJSON});

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));
            result.current.resetFilters();

            expect(Navigation.setParams).toHaveBeenCalledWith({q: buildQueryStringWithResetFilters(currentSearchQueryJSON, currentDefaultSearchQueryJSON), rawQuery: undefined});
            expect(setSearchContext).toHaveBeenCalledWith(false);
        });

        it('navigates to the query the filters reset to when there is no default query', () => {
            const currentSearchQueryJSON = buildQueryJSON(categoryFilters);
            mockSearchQueryContext({currentSearchQueryJSON});

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));
            result.current.resetFilters();

            expect(Navigation.setParams).toHaveBeenCalledWith({q: buildQueryStringWithResetFilters(currentSearchQueryJSON, undefined), rawQuery: undefined});
            expect(setSearchContext).toHaveBeenCalledWith(false);
        });

        it('does nothing when there is no current query', () => {
            mockSearchQueryContext();

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));
            result.current.resetFilters();

            expect(Navigation.setParams).not.toHaveBeenCalled();
            expect(setSearchContext).not.toHaveBeenCalled();
        });
    });
});
