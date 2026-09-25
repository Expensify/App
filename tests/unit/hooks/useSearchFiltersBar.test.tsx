import {renderHook} from '@testing-library/react-native';

import useSearchFiltersBar from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import type {FilterItem} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import type {SearchQueryJSON} from '@components/Search/types';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildQueryStringWithResetFilters} from '@libs/SearchQueryUtils';
import type * as SearchUIUtils from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

const mockSetFilterQueryParams = jest.fn();
const mockUpdateFilterQueryParams = jest.fn();
const mockUseSearchResultsContext = jest.fn<Record<string, unknown>, []>();
const mockUseSearchQueryContext = jest.fn<Record<string, unknown>, []>();
/** The positional arguments the hook passes to `mapFiltersFormToLabelValueList`, so its mapper stays typed. */
type MapFiltersFormToLabelValueListArgs = [
    searchAdvancedFiltersForm: unknown,
    defaultSearchQueryFilterKeys: unknown,
    skipFilters: unknown,
    translate: unknown,
    dateFnsLocale: unknown,
    localeCompare: unknown,
    convertToDisplayStringWithoutCurrency: unknown,
    mapper: (filterKey: string, isDefault: boolean) => FilterItem,
];
const mockMapFiltersFormToLabelValueList = jest.fn<unknown[], MapFiltersFormToLabelValueListArgs>();

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({setFilterQueryParams: mockSetFilterQueryParams, updateFilterQueryParams: mockUpdateFilterQueryParams}),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    ...jest.requireActual<typeof SearchUIUtils>('@libs/SearchUIUtils'),
    mapFiltersFormToLabelValueList: (...args: MapFiltersFormToLabelValueListArgs) => mockMapFiltersFormToLabelValueList(...args),
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
        currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
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

    describe('hasFiltersChanged', () => {
        it('is true when the default query filters differ from the current query filters', () => {
            mockSearchQueryContext({
                currentDefaultSearchQueryJSON: buildQueryJSON(merchantFilters),
                currentSearchQueryJSON: buildQueryJSON(categoryFilters),
            });

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.hasFiltersChanged).toBe(true);
        });

        it('is false when the default query filters equal the current query filters', () => {
            mockSearchQueryContext({
                currentDefaultSearchQueryJSON: buildQueryJSON(merchantFilters),
                currentSearchQueryJSON: buildQueryJSON(merchantFilters),
            });

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.hasFiltersChanged).toBe(false);
        });

        it('falls back to having filters when there is no default query JSON', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([{key: 'merchant'}]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.hasFiltersChanged).toBe(true);
        });

        it('is false when there is no default query JSON and no filters', () => {
            mockSearchQueryContext();
            mockMapFiltersFormToLabelValueList.mockReturnValue([]);

            const {result} = renderHook(() => useSearchFiltersBar(queryJSON));

            expect(result.current.hasFiltersChanged).toBe(false);
        });
    });

    describe('filter chips', () => {
        /** Renders the hook and returns the mapper it hands to `mapFiltersFormToLabelValueList`, applied to `filterKey`. */
        function getFilterItem(filterKey: string, isDefault: boolean) {
            renderHook(() => useSearchFiltersBar(queryJSON));
            const mapper = mockMapFiltersFormToLabelValueList.mock.calls.at(0)?.[7];
            return mapper?.(filterKey, isDefault);
        }

        it('can be removed when the filter is one a saved search was saved with', () => {
            // Given a saved search, whose own filters are marked as default
            mockSearchQueryContext({currentSearchKey: savedSearchIDToSearchKey('100')});

            // When the close button of one of those filters is pressed
            const item = getFilterItem(CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, true);
            item?.onClosePress?.();

            // Then it is cleared: a saved search is the user's own query, so all of its filters are theirs to drop
            expect(mockUpdateFilterQueryParams).toHaveBeenCalledWith({[CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT]: undefined});
        });

        it('cannot be removed when the filter is one a suggested search is defined by', () => {
            // Given a suggested search, which is identified by the default filters it comes with
            mockSearchQueryContext({currentSearchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            // When one of those default filters is mapped to a chip
            const item = getFilterItem(CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, true);

            // Then it has no close button, so the search keeps the filters that make it that search
            expect(item?.onClosePress).toBeUndefined();
        });

        it('can be removed when the filter is one the user added on top of a suggested search', () => {
            // Given a suggested search and a filter that isn't one of its defaults
            mockSearchQueryContext({currentSearchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            // When its close button is pressed
            const item = getFilterItem(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, false);
            item?.onClosePress?.();

            // Then it is cleared
            expect(mockUpdateFilterQueryParams).toHaveBeenCalledWith({[CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]: undefined});
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
