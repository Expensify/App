import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import SearchAdvancedFiltersProvider, {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import {useContext} from 'react';

const mockUseOnyx = jest.fn<[Partial<SearchAdvancedFiltersForm> | undefined], []>();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => mockUseOnyx(),
}));

const mockGetUpdatedFilterFormValues = jest.fn((current: Record<string, unknown>, next: Record<string, unknown>) => ({...current, ...next}));
const mockSetFilterQueryParams = jest.fn();

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({getUpdatedFilterFormValues: mockGetUpdatedFilterFormValues, setFilterQueryParams: mockSetFilterQueryParams}),
}));

const mockUseSearchQueryContext = jest.fn<QueryContext, []>();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockUseSearchQueryContext(),
}));

const mockSetSearchContext = jest.fn<void, unknown[]>();

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
    currentDefaultSearchQueryJSON: SearchQueryJSON | undefined;
};

function mockOnyxForm(form: Partial<SearchAdvancedFiltersForm> | undefined) {
    mockUseOnyx.mockReturnValue([form]);
}

function mockQueryContext(context: Partial<QueryContext>) {
    mockUseSearchQueryContext.mockReturnValue({
        currentDefaultSearchQueryString: '',
        currentSearchQueryJSON: undefined,
        currentDefaultSearchQueryJSON: undefined,
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
        jest.mocked(Navigation.setParams).mockClear();
        // Make dismissModal run the afterTransition callback synchronously so resetFilters/applyFilters take effect.
        jest.mocked(Navigation.dismissModal).mockImplementation((options?: {afterTransition?: () => void}) => options?.afterTransition?.());
    });

    describe('shouldShowResetFilters', () => {
        it('is true when the default query filters differ from the current query filters', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({
                currentDefaultSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`),
                currentSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon category:Food`),
            });

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when the default query filters equal the current query filters', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({
                currentDefaultSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`),
                currentSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`),
            });

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('is false when the queries differ only by the keyword', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({
                currentDefaultSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`),
                currentSearchQueryJSON: buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon coffee`),
            });

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('is true when there is no default query JSON and non-type filter is applied', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});
            mockQueryContext({currentDefaultSearchQueryJSON: undefined});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(true);
        });

        it('is false when there is no default query JSON and only the type filter is applied', () => {
            mockOnyxForm({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
            mockQueryContext({currentDefaultSearchQueryJSON: undefined});

            const {result} = renderProvider();

            expect(result.current.shouldShowResetFilters).toBe(false);
        });

        it('is false when there is no default query JSON and no filters', () => {
            mockOnyxForm(undefined);
            mockQueryContext({currentDefaultSearchQueryJSON: undefined});

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
