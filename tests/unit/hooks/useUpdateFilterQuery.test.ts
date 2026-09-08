import {act, renderHook} from '@testing-library/react-native';

import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterFormValuesFromQuery, buildSearchQueryJSON, getAdvancedFiltersToReset} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {setParams: jest.fn()},
}));

describe('useUpdateFilterQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function setup() {
        const queryJSON = buildSearchQueryJSON('merchant=I merchant*:I');
        if (!queryJSON) {
            throw new Error('Invalid test query');
        }

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {}, {});
        (jest.mocked(useOnyx) as jest.Mock).mockImplementation((key: string) => [key === ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM ? form : {}]);

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

    test('removes all Merchant predicates when resetting advanced filters', () => {
        const {result, form} = setup();

        act(() => {
            result.current.setFilterQueryParams(getAdvancedFiltersToReset(form));
        });

        expect(getNavigatedQuery()?.flatFilters).toEqual([]);
    });
});
