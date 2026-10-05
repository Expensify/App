import {renderHook} from '@testing-library/react-native';

import useSearchFiltersBar from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import type {SearchQueryJSON} from '@components/Search/types';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetFilters} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

const mockSetFilterQueryParams = jest.fn();
const mockUpdateFilterQueryParams = jest.fn();
const mockUseSearchResultsContext = jest.fn<Record<string, unknown>, []>();
const mockUseSearchQueryContext = jest.fn<Record<string, unknown>, []>();
const mockMapFiltersFormToLabelValueList = jest.fn<unknown[], unknown[]>();
const mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => [mockOnyxData[key]],
}));

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({setFilterQueryParams: mockSetFilterQueryParams, updateFilterQueryParams: mockUpdateFilterQueryParams}),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    mapFiltersFormToLabelValueList: (...args: unknown[]) => mockMapFiltersFormToLabelValueList(...args),
    SKIPPED_SEARCH_FILTERS: jest.requireActual<{SKIPPED_SEARCH_FILTERS: Set<string>}>('@libs/SearchUIUtils').SKIPPED_SEARCH_FILTERS,
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
        currentDefaultSearchQueryFilterKeys: new Set(),
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
        delete mockOnyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM];
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

    describe('skipped filters', () => {
        function getSkippedFilters() {
            const skippedFilters = mockMapFiltersFormToLabelValueList.mock.calls.at(-1)?.at(2);
            return skippedFilters instanceof Set ? skippedFilters : undefined;
        }

        function mockApproveToDoView(searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>) {
            const approveFilters: SearchQueryJSON['flatFilters'] = [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.ACTION_FILTERS.APPROVE}]},
            ];
            mockSearchQueryContext({
                currentDefaultSearchQueryFilterKeys: new Set([CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION]),
                currentDefaultSearchQueryJSON: buildQueryJSON(approveFilters),
            });
            mockOnyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = searchAdvancedFiltersForm;
        }

        it('shows the action filter when it is not part of the default query', () => {
            // Given a view whose default query has no action filter, like Spend > Reports
            mockSearchQueryContext({currentDefaultSearchQueryFilterKeys: new Set([CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE])});

            // When the filters bar is built
            renderHook(() => useSearchFiltersBar(queryJSON));

            // Then neither the action filter nor its negation is skipped, so either shows as a removable chip
            expect(getSkippedFilters()?.has(CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION)).toBe(false);
            expect(getSkippedFilters()?.has(FILTER_KEYS.ACTION_NOT)).toBe(false);
        });

        it('hides the action filter when it matches the default query', () => {
            // Given a to-do view like Approve, whose default query is built from action:approve, showing that same action
            mockApproveToDoView({[FILTER_KEYS.ACTION]: CONST.SEARCH.ACTION_FILTERS.APPROVE});

            // When the filters bar is built
            renderHook(() => useSearchFiltersBar(queryJSON));

            // Then the action filter is skipped so the to-do view looks the same as before
            expect(getSkippedFilters()?.has(CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION)).toBe(true);
        });

        it('shows the action filter when it differs from the default query', () => {
            // Given the Approve to-do view whose query was changed to a different action, e.g. through a link that kept the Approve search key
            mockApproveToDoView({[FILTER_KEYS.ACTION]: CONST.SEARCH.ACTION_FILTERS.PAY});

            // When the filters bar is built
            renderHook(() => useSearchFiltersBar(queryJSON));

            // Then the action filter isn't skipped, so the changed action shows as a chip instead of being hidden
            expect(getSkippedFilters()?.has(CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION)).toBe(false);
        });

        it('shows the negated action filter even when the default query has the same action', () => {
            // Given the Approve to-do view whose query was changed to -action:approve, which is the opposite of the default
            mockApproveToDoView({[FILTER_KEYS.ACTION_NOT]: CONST.SEARCH.ACTION_FILTERS.APPROVE});

            // When the filters bar is built
            renderHook(() => useSearchFiltersBar(queryJSON));

            // Then neither the action filter nor its negation is skipped, so the negated action shows as a chip
            expect(getSkippedFilters()?.has(CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION)).toBe(false);
            expect(getSkippedFilters()?.has(FILTER_KEYS.ACTION_NOT)).toBe(false);
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
