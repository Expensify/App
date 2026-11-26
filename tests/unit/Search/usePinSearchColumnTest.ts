import {act, renderHook} from '@testing-library/react-native';

import usePinSearchColumn from '@components/Search/hooks/usePinSearchColumn';

import {saveSearchFilters} from '@libs/actions/Search';
import {isQueryARefinement, markQueryAsRefinement} from '@libs/SearchQueryRefinement';
import {buildSearchQueryJSON, getFilterFromQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

const mockSetParams = jest.fn<void, [{q: string}]>();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useNavigation: () => ({setParams: mockSetParams}),
}));

jest.mock('@libs/actions/Search', () => ({
    saveSearchFilters: jest.fn(),
}));

const PINNED_MERCHANT = `${CONST.SEARCH.SYNTAX_ROOT_KEYS.LEFT_PINNED_COLUMNS}:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT}`;

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Unparseable query: ${query}`);
    }
    return queryJSON;
}

function getNavigatedQueryJSON() {
    return getQueryJSON(mockSetParams.mock.lastCall?.[0].q ?? '');
}

describe('usePinSearchColumn', () => {
    beforeEach(() => {
        mockSetParams.mockClear();
        jest.mocked(saveSearchFilters).mockClear();
    });

    it('draws the pins of the current search while the table still shows the results from before a filter change', () => {
        // Given a table still showing an expense search from before Merchant was pinned, while the pinned search with a Draft filter loads
        const shownQueryJSON = getQueryJSON('type:expense');
        const currentSearchQueryJSON = getQueryJSON(`type:expense status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS} ${PINNED_MERCHANT}`);

        // When the table asks which columns are pinned
        const {result} = renderHook(() => usePinSearchColumn(shownQueryJSON, currentSearchQueryJSON, CONST.SEARCH.SEARCH_KEYS.EXPENSES));

        // Then Merchant stays pinned, because the pins belong to the search the user is on, not to the results kept on screen
        expect(result.current.pinnedColumns).toEqual({left: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT], right: []});
    });

    it('pins a column on the current search, keeping a filter whose results have not arrived yet', () => {
        // Given a table still showing an unfiltered expense search with Merchant pinned, while the same search with a Draft filter loads
        const shownQueryJSON = getQueryJSON(`type:expense ${PINNED_MERCHANT}`);
        const currentSearchQueryJSON = getQueryJSON(`type:expense status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS} ${PINNED_MERCHANT}`);
        const {result} = renderHook(() => usePinSearchColumn(shownQueryJSON, currentSearchQueryJSON, CONST.SEARCH.SEARCH_KEYS.EXPENSES));

        // When Category is pinned to the right from its menu
        act(() => result.current.pinColumn(CONST.SEARCH.TABLE_COLUMNS.CATEGORY, CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT));

        // Then the new search keeps the Draft filter and both pins, and the same query is saved for the Expenses search,
        // so reopening Spend doesn't bring back the unfiltered search either
        const navigatedQueryJSON = getNavigatedQueryJSON();
        expect(getFilterFromQuery(navigatedQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS).value).toEqual([CONST.SEARCH.STATUS.EXPENSE.DRAFTS]);
        expect([navigatedQueryJSON.leftPinnedColumns ?? []].flat()).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT]);
        expect([navigatedQueryJSON.rightPinnedColumns ?? []].flat()).toEqual([CONST.SEARCH.TABLE_COLUMNS.CATEGORY]);
        expect(saveSearchFilters).toHaveBeenCalledWith(CONST.SEARCH.SEARCH_KEYS.EXPENSES, navigatedQueryJSON.inputQuery);
    });

    it('keeps holding the previous results when a column is pinned while a filter change loads', () => {
        // Given the table still showing an expense search while the same search with a Draft filter, applied from the filters, loads
        const shownQueryJSON = getQueryJSON('type:expense');
        const currentSearchQueryJSON = getQueryJSON(`type:expense status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS}`);
        markQueryAsRefinement(currentSearchQueryJSON.inputQuery);
        const {result} = renderHook(() => usePinSearchColumn(shownQueryJSON, currentSearchQueryJSON, CONST.SEARCH.SEARCH_KEYS.EXPENSES));

        // When Merchant is pinned before the filtered results arrive
        act(() => result.current.pinColumn(CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT));

        // Then the pinned search counts as the same refinement, because a pin doesn't change the results, so the table on screen
        // stays instead of turning into a loading skeleton
        expect(isQueryARefinement(getNavigatedQueryJSON().inputQuery)).toBe(true);
    });

    it('does not hold any results when a column is pinned on a search that is not loading a filter change', () => {
        // Given a loaded expense search that was opened directly rather than refined from the filters
        const queryJSON = getQueryJSON(`type:expense status:${CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING}`);
        markQueryAsRefinement('type:expense');
        const {result} = renderHook(() => usePinSearchColumn(queryJSON, queryJSON, CONST.SEARCH.SEARCH_KEYS.EXPENSES));

        // When Merchant is pinned
        act(() => result.current.pinColumn(CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT));

        // Then the pinned search isn't marked as a refinement, so the page never holds results that belong to another search
        expect(isQueryARefinement(getNavigatedQueryJSON().inputQuery)).toBe(false);
    });

    it('offers pins by the table on screen, not by the search that is still loading', () => {
        // Given a table still showing an ungrouped expense search, while the same search grouped by category loads
        const shownQueryJSON = getQueryJSON('type:expense');
        const currentSearchQueryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.CATEGORY}`);

        // When the table asks whether its columns can be pinned
        const {result} = renderHook(() => usePinSearchColumn(shownQueryJSON, currentSearchQueryJSON, CONST.SEARCH.SEARCH_KEYS.EXPENSES));

        // Then they can, so the pinned columns of the expense table on screen don't jump back before the grouped table replaces it
        expect(result.current.canPinColumns).toBe(true);
    });
});
