import {renderHook} from '@testing-library/react-native';

import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';

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

/** The params of the single `Navigation.setParams` call made by `setFilterQueryParams`. */
function getSetParamsCall() {
    expect(Navigation.setParams).toHaveBeenCalledTimes(1);
    const [params] = jest.mocked(Navigation.setParams).mock.calls.at(0) ?? [];
    return params ?? {};
}

describe('useUpdateFilterQuery', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE} satisfies Partial<SearchAdvancedFiltersForm>;
        mockGetSearchKeyForQuery.mockReset();
        mockGetSearchKeyForQuery.mockReturnValue(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        jest.mocked(Navigation.setParams).mockClear();
    });

    describe('setFilterQueryParams', () => {
        it('writes the re-derived search key to the route when the type changes', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(mockGetSearchKeyForQuery).toHaveBeenCalledWith(expect.objectContaining({type: CONST.SEARCH.DATA_TYPES.INVOICE}));
            expect(getSetParamsCall()).toEqual(expect.objectContaining({searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS}));
        });

        it('clears the search key when the new query matches no search', () => {
            mockGetSearchKeyForQuery.mockReturnValue(undefined);
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(getSetParamsCall()).toHaveProperty('searchKey', undefined);
        });

        it('leaves the search key param alone when the type is set to the one the form already holds', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });

        it('leaves the search key param alone when the type is unchanged', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });

        it('leaves the search key param alone when no type is provided', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({merchant: 'Amazon'});

            expect(getSetParamsCall()).not.toHaveProperty('searchKey');
        });
    });
});
