import {getLastVisitedSearch, resetMoreDestinationHistory, setLastVisitedSearch} from '@libs/MoreDestinationHistory';
import {reopenLastVisitedSearch} from '@libs/MoreNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {ACCOUNTING_GROUP_ID, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import type {SaveSearch} from '@src/types/onyx';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@libs/interceptAnonymousUser', () => (callback: () => void) => callback());

jest.mock('@libs/actions/Search', () => ({
    setSearchContext: jest.fn(),
}));

const SAVED_SEARCH_ID = '123';

const savedSearches: SaveSearch = {
    [SAVED_SEARCH_ID]: {name: 'My search', query: 'type:expense'},
};

describe('MoreNavigationUtils', () => {
    beforeEach(() => {
        resetMoreDestinationHistory();
        jest.mocked(Navigation.navigate).mockClear();
    });

    it('reopens the last visited search with the query the user left on it', () => {
        // Given the user last had an Accounting search open with a filter applied
        setLastVisitedSearch(ACCOUNTING_GROUP_ID, {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPORT, query: 'type:expense-report action:export amount>10'});
        const clearSelectedTransactions = jest.fn();

        // When the More menu reopens Accounting
        const didReopen = reopenLastVisitedSearch(ACCOUNTING_GROUP_ID, savedSearches, clearSelectedTransactions);

        // Then it navigates to that exact query, so the filter the user applied survives the round trip
        expect(didReopen).toBe(true);
        expect(clearSelectedTransactions).toHaveBeenCalled();
        expect(jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0)).toContain(encodeURIComponent('amount>10'));
    });

    it('does not reopen a saved search that has since been deleted', () => {
        // Given the user last had a saved search open that no longer exists
        setLastVisitedSearch(SAVED_SEARCHES_GROUP_ID, {searchKey: savedSearchIDToSearchKey('456'), query: 'type:expense', name: 'Deleted'});

        // When the More menu tries to reopen the Saved group
        const didReopen = reopenLastVisitedSearch(SAVED_SEARCHES_GROUP_ID, savedSearches, jest.fn());

        // Then it reports nothing to reopen, so the caller falls back to the More page instead of a dead search
        expect(didReopen).toBe(false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('forgets every remembered place on reset', () => {
        // Given the user had a saved search open in this session
        setLastVisitedSearch(SAVED_SEARCHES_GROUP_ID, {searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID), query: 'type:expense', name: 'My search'});

        // When the history is reset, as it is on sign-out
        resetMoreDestinationHistory();

        // Then the next account signing in on this device does not inherit the previous account's place
        expect(getLastVisitedSearch(SAVED_SEARCHES_GROUP_ID)).toBeUndefined();
    });
});
