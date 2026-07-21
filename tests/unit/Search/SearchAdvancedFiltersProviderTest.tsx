import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';

import SearchAdvancedFiltersProvider, {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useContext} from 'react';

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => mockUseOnyx(),
}));

const mockGetUpdatedFilterFormValues = jest.fn((current: unknown, next: unknown) => ({...(current as object), ...(next as object)}));
const mockSetFilterQueryParams = jest.fn();

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({getUpdatedFilterFormValues: mockGetUpdatedFilterFormValues, setFilterQueryParams: mockSetFilterQueryParams}),
}));

const mockUseSearchQueryContext = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockUseSearchQueryContext(),
}));

const mockSetSearchContext = jest.fn();

jest.mock('@libs/actions/Search', () => ({
    setSearchContext: (...args: unknown[]) => mockSetSearchContext(...args),
}));

jest.mock('@libs/Navigation/Navigation');

function useFilters() {
    return {...useContext(SearchAdvancedFiltersContext), ...useContext(SearchAdvancedFiltersActionContext)};
}

function renderProvider() {
    return renderHook(useFilters, {wrapper: SearchAdvancedFiltersProvider});
}

type QueryContext = {
    currentDefaultSearchQueryString: string;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    currentSearchHash: number;
    currentDefaultSearchHash: number;
};

function mockOnyxForm(form: Partial<SearchAdvancedFiltersForm> | undefined) {
    mockUseOnyx.mockReturnValue([form]);
}

function mockQueryContext(context: Partial<QueryContext>) {
    mockUseSearchQueryContext.mockReturnValue({
        currentDefaultSearchQueryString: '',
        currentSearchQueryJSON: undefined,
        currentSearchHash: 0,
        currentDefaultSearchHash: 0,
        ...context,
    });
}

describe('SearchAdvancedFiltersProvider', () => {
    beforeEach(() => {
        mockUseOnyx.mockReset();
        mockUseSearchQueryContext.mockReset();
        mockGetUpdatedFilterFormValues.mockClear();
        mockSetFilterQueryParams.mockClear();
        mockSetSearchContext.mockClear();
        (Navigation.setParams as jest.Mock).mockClear();
        // Make dismissModal run the afterTransition callback synchronously so resetFilters/applyFilters take effect.
        (Navigation.dismissModal as jest.Mock).mockImplementation((options?: {afterTransition?: () => void}) => options?.afterTransition?.());
    });

    describe('shouldShowResetFilters', () => {
        it('is true when the default hash differs from the current hash', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({currentDefaultSearchHash: 1, currentSearchHash: 2});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when the default hash equals the current hash', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({currentDefaultSearchHash: 5, currentSearchHash: 5});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('falls back to having a non-type filter when there is no default hash', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});
            mockQueryContext({currentDefaultSearchHash: 0});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when there is no default hash and only the type filter is applied', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({currentDefaultSearchHash: 0});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('is false when there is no default hash and no filters', () => {
            mockOnyxForm(undefined);
            mockQueryContext({currentDefaultSearchHash: 0});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });
    });

    describe('resetFilters', () => {
        it('navigates to the default query string when one exists', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({currentDefaultSearchQueryString: 'type:expense status:all'});

            const {result} = renderProvider();
            result.current.resetFilters();

            expect(Navigation.setParams).toHaveBeenCalledTimes(1);
            expect(Navigation.setParams).toHaveBeenCalledWith({q: 'type:expense status:all', rawQuery: undefined});
            expect(mockSetFilterQueryParams).not.toHaveBeenCalled();
            expect(mockSetSearchContext).toHaveBeenCalledWith(false);
        });

        it('resets to the form type when there is no default query string', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.INVOICE});
            mockQueryContext({currentDefaultSearchQueryString: ''});

            const {result} = renderProvider();
            result.current.resetFilters();

            expect(mockSetFilterQueryParams).toHaveBeenCalledTimes(1);
            expect(mockSetFilterQueryParams).toHaveBeenCalledWith({[CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE]: CONST.SEARCH.DATA_TYPES.INVOICE});
            expect(Navigation.setParams).not.toHaveBeenCalled();
            expect(mockSetSearchContext).toHaveBeenCalledWith(false);
        });
    });
});
