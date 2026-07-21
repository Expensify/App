import {renderHook} from '@testing-library/react-native';

import useSearchFiltersBar from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import type {SearchQueryJSON} from '@components/Search/types';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';

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
        currentDefaultSearchQueryString: '',
        currentDefaultSearchQueryFilterKeys: [],
        currentSearchHash: 0,
        currentDefaultSearchHash: 0,
        ...overrides,
    });
}

describe('useSearchFiltersBar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchResultsContext();
        mockSearchQueryContext();
        mockMapFiltersFormToLabelValueList.mockReturnValue([]);
    });

    describe('shouldShowResetFilters', () => {
        it('is true when the default hash differs from the current hash', () => {
            mockSearchQueryContext({currentDefaultSearchHash: 1, currentSearchHash: 2});

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when the default hash equals the current hash', () => {
            mockSearchQueryContext({currentDefaultSearchHash: 5, currentSearchHash: 5});

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('falls back to having filters when there is no default hash', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([{key: 'merchant'}]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when there is no default hash and no filters', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.shouldShowResetFilters).toBe(false);
        });
    });

    describe('resetFilters', () => {
        it('navigates to the default query string when one exists', () => {
            mockSearchQueryContext({currentDefaultSearchQueryString: 'type:expense status:all'});

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));
            result.current.resetFilters();

            expect(Navigation.setParams).toHaveBeenCalledTimes(1);
            expect(Navigation.setParams).toHaveBeenCalledWith({q: 'type:expense status:all', rawQuery: undefined});
            expect(mockSetFilterQueryParams).not.toHaveBeenCalled();
            expect(setSearchContext).toHaveBeenCalledWith(false);
        });

        it('resets to the query type when there is no default query string', () => {
            mockSearchQueryContext();

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));
            result.current.resetFilters();

            expect(mockSetFilterQueryParams).toHaveBeenCalledTimes(1);
            expect(mockSetFilterQueryParams).toHaveBeenCalledWith({[CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE]: queryJSON.type});
            expect(Navigation.setParams).not.toHaveBeenCalled();
            expect(setSearchContext).toHaveBeenCalledWith(false);
        });
    });
});
