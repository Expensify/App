import {act, renderHook} from '@testing-library/react-native';

import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterFormValuesFromQuery, buildQueryStringWithResetFilters, buildSearchQueryJSON, VIOLATION_HAS_VALUES} from '@libs/SearchQueryUtils';

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

    describe('required violation stages', () => {
        it.each([{has: []}, {has: [CONST.SEARCH.HAS_VALUES.ATTACHMENT]}])('does not restore expense violation stages when switching to Chat (%j)', ({has}) => {
            // Given an expense search whose violation filter requires expense stages
            const currentValues: Partial<SearchAdvancedFiltersForm> = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                violationName: ['overLimit'],
                has: [...has, ...VIOLATION_HAS_VALUES],
            };
            onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = currentValues;
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When switching to Chat removes unsupported Has values
            const updated = result.current.getUpdatedFilterFormValues(currentValues, {type: CONST.SEARCH.DATA_TYPES.CHAT});
            act(() => {
                result.current.updateFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.CHAT});
            });

            // Then normalization does not restore hidden expense stages or serialize them into the Chat query
            expect(updated.has ?? []).toEqual(has);
            const query = getNavigatedQuery();
            expect(query?.type).toBe(CONST.SEARCH.DATA_TYPES.CHAT);
            expect(query?.flatFilters.filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION)).toEqual([]);
            expect(query?.flatFilters.filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS)).toEqual(
                has.length ? [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.HAS_VALUES.ATTACHMENT}]}] : [],
            );
        });

        it.each([undefined, [], [CONST.SEARCH.HAS_VALUES.RECEIPT]])('adds both stages without dropping existing Has values (%j)', (has) => {
            // Given a form with no positive violation stage
            const currentValues = {type: CONST.SEARCH.DATA_TYPES.EXPENSE, has};
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When a positive violation filter is selected in the UI
            const updated = result.current.getUpdatedFilterFormValues(currentValues, {violationName: ['overLimit']});

            // Then both stages are added and unrelated selections are kept without mutating the original form
            expect(updated.has).toEqual([...(has ?? []), ...VIOLATION_HAS_VALUES]);
            expect(currentValues.has).toEqual(has);
        });

        it.each(VIOLATION_HAS_VALUES)('preserves the explicitly chosen %s stage', (stage) => {
            // Given a form already scoped to one positive violation stage
            const currentValues = {has: [CONST.SEARCH.HAS_VALUES.RECEIPT, stage]};
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When the violation filter changes
            const updated = result.current.getUpdatedFilterFormValues(currentValues, {violationName: ['overLimit']});

            // Then the other stage is not added
            expect(updated.has).toEqual(currentValues.has);
        });

        it('ignores a negated violation filter', () => {
            // Given a form without positive violation filters
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When only a negated violation filter is selected
            const updated = result.current.getUpdatedFilterFormValues({}, {violationNameNot: ['overLimit']});

            // Then no Has stages are added
            expect(updated.has).toBeUndefined();
        });

        it('does not count negated Has stages as positive selections', () => {
            // Given only negated violation stages
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When a positive violation filter is selected
            const updated = result.current.getUpdatedFilterFormValues({hasNot: [...VIOLATION_HAS_VALUES]}, {violationName: ['overLimit']});

            // Then positive stages are added and negated stages are left alone
            expect(updated.has).toEqual(VIOLATION_HAS_VALUES);
            expect(updated.hasNot).toEqual(VIOLATION_HAS_VALUES);
        });

        it('does not restore Has when the Has pill clears its dependent positive violation filter', () => {
            // Given positive and negated violation filters with positive Has stages
            const currentValues: Partial<SearchAdvancedFiltersForm> = {
                violationName: ['overLimit'],
                violationNameNot: ['missingCategory'],
                has: [...VIOLATION_HAS_VALUES],
            };
            const {result} = renderHook(() => useUpdateFilterQuery(baseQueryJSON));

            // When closing the Has pill clears both positive filters in one update
            const updated = result.current.getUpdatedFilterFormValues(currentValues, {has: undefined, violationName: undefined});

            // Then neither positive filter is restored and the negated violation filter survives
            expect(updated.has).toBeUndefined();
            expect(updated.violationName).toBeUndefined();
            expect(updated.violationNameNot).toEqual(['missingCategory']);
        });

        it('leaves a typed violation query with no Has stages alone', () => {
            // Given a typed query without an explicit Has filter
            const query = buildSearchQueryJSON('violation:overLimit');
            if (!query) {
                throw new Error('Invalid test query');
            }

            // When the typed query is parsed into form values, outside the UI edit path
            const form = buildFilterFormValuesFromQuery(query, {}, {}, {}, {}, {}, {});

            // Then its implicit stages remain implicit
            expect(form.violationName).toEqual(['overLimit']);
            expect(form.has ?? []).toEqual([]);
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
