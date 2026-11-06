import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type * as SearchContext from '@components/Search/SearchContext';
import {SearchQueryContext, useSearchQueryContext} from '@components/Search/SearchContext';
import useSearchFiltersReset from '@components/Search/SearchPageHeader/useSearchFiltersReset';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetFilters, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {useContext} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContext>('@components/Search/SearchContext'),
    useSearchQueryContext: jest.fn(),
}));
jest.mock('@libs/actions/Search');
jest.mock('@libs/Navigation/Navigation');

const mockUseSearchQueryContext = jest.mocked(useSearchQueryContext);
const defaultQuery = buildSearchQueryJSON('type:expense status:all');
const filteredQuery = buildSearchQueryJSON('type:expense status:all merchant:zzzz');

describe('useSearchFiltersReset', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        const {result} = renderHook(() => useContext(SearchQueryContext));
        mockUseSearchQueryContext.mockReturnValue({
            ...result.current,
            currentSearchQueryJSON: filteredQuery,
            currentDefaultSearchQueryJSON: defaultQuery,
        });
    });

    afterEach(async () => {
        await act(async () => Onyx.clear());
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['changed filters', filteredQuery, true],
        ['default filters', defaultQuery, false],
        ['a keyword only', buildSearchQueryJSON('type:expense status:all lunch'), false],
    ] as const)('computes reset availability for %s', (_description, queryJSON, expected) => {
        // Given an applied query and a view default
        mockUseSearchQueryContext.mockReturnValue({...mockUseSearchQueryContext(), currentSearchQueryJSON: queryJSON});

        // When reset availability is evaluated
        const {result} = renderHook(() => useSearchFiltersReset(), {wrapper: LocaleContextProvider});

        // Then only resettable filter changes enable the action
        expect(result.current.canReset).toBe(expected);
    });

    it.each([true, false])('uses visible filters without a default query (has filter: %s)', async (hasFilter) => {
        // Given an ad-hoc query with no view default
        mockUseSearchQueryContext.mockReturnValue({...mockUseSearchQueryContext(), currentDefaultSearchQueryJSON: undefined});
        await act(async () => Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, hasFilter ? {merchant: 'zzzz'} : {}));

        // When the same filter mapping used by the bar is evaluated
        const {result} = renderHook(() => useSearchFiltersReset(), {wrapper: LocaleContextProvider});
        await waitForBatchedUpdatesWithAct();

        // Then reset is available exactly when a visible filter exists
        expect(result.current.canReset).toBe(hasFilter);
    });

    it('restores the default query and leaves the search context', () => {
        // Given a filtered query with view-specific defaults
        if (!filteredQuery) {
            throw new Error('Invalid test query');
        }
        const {result} = renderHook(() => useSearchFiltersReset());

        // When filters are reset
        act(() => result.current.resetFilters());

        // Then the existing navigation reset contract is preserved
        expect(Navigation.setParams).toHaveBeenCalledWith({q: buildQueryStringWithResetFilters(filteredQuery, defaultQuery), rawQuery: undefined});
        expect(setSearchContext).toHaveBeenCalledWith(false);
    });

    it('does nothing without a current query', () => {
        // Given no applied query
        mockUseSearchQueryContext.mockReturnValue({...mockUseSearchQueryContext(), currentSearchQueryJSON: undefined});
        const {result} = renderHook(() => useSearchFiltersReset());

        // When reset is requested
        act(() => result.current.resetFilters());

        // Then navigation and search context remain untouched
        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(setSearchContext).not.toHaveBeenCalled();
    });
});
