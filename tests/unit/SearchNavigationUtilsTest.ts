import {setSearchContext} from '@libs/actions/Search';
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavCannedSearchItem, FlatNavSavedSearchItem, FlatNavSection} from '@libs/Navigation/FlatNav/types';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';
import navigateToCannedSpendSearch, {navigateToFlatNavItem, navigateToFlatNavSection, navigateToSearch, navigateToSpendTab} from '@libs/SearchNavigationUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchFilters} from '@src/types/onyx';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Search'),
    setSearchContext: jest.fn(),
}));

const {SEARCH_KEYS} = CONST.SEARCH;
const EXPENSES_QUERY = buildCannedSearchQuery();
const REPORTS_QUERY = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT});
const SAVED_SEARCH_ID = '42';
const SAVED_SEARCH_KEY = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
const FILTER_TIMESTAMP = '2026-01-01 00:00:00';
const SAVED_QUERY = 'type:expense merchant:Starbucks';

const expensesItem: FlatNavCannedSearchItem = {
    type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
    key: SEARCH_KEYS.EXPENSES,
    sectionID: FLAT_NAV.SECTION.EXPENSES,
    translationPath: 'search.tabs.expenses',
    iconName: 'Receipt',
    searchQuery: EXPENSES_QUERY,
};

function createSavedSearchItem(overrides: Partial<FlatNavSavedSearchItem> = {}): FlatNavSavedSearchItem {
    return {
        type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
        key: SAVED_SEARCH_KEY,
        sectionID: FLAT_NAV.SECTION.SAVED,
        savedSearchID: SAVED_SEARCH_ID,
        name: 'Coffee',
        title: 'Coffee',
        query: SAVED_QUERY,
        iconName: 'Bookmark',
        isDisabled: false,
        ...overrides,
    };
}

describe('SearchNavigationUtils', () => {
    const clearSelectedTransactions = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('navigateToCannedSpendSearch', () => {
        it('should clear the selection and open the default query when there is no last query', () => {
            // Given a canned search the user has never left a query on
            // When we navigate to it
            navigateToCannedSpendSearch(SEARCH_KEYS.EXPENSES, EXPENSES_QUERY, undefined, clearSelectedTransactions);

            // Then the selection is cleared, the search context is reset and the default query opens
            expect(clearSelectedTransactions).toHaveBeenCalledTimes(1);
            expect(setSearchContext).toHaveBeenCalledWith(false);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: EXPENSES_QUERY, searchKey: SEARCH_KEYS.EXPENSES}));
        });
    });

    describe('navigateToSpendTab', () => {
        it('should open the expenses query for the Expenses tab', () => {
            // Given the Expenses tab and no last query
            const searchKey: SpendTabSearchKey = SEARCH_KEYS.EXPENSES;

            // When we navigate to it
            navigateToSpendTab(searchKey, undefined, clearSelectedTransactions);

            // Then the default expenses query opens under the expenses key
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: EXPENSES_QUERY, searchKey: SEARCH_KEYS.EXPENSES}));
        });

        it('should open the expense report query for the Reports tab', () => {
            // Given the Reports tab and no last query
            // When we navigate to it
            navigateToSpendTab(SEARCH_KEYS.REPORTS, undefined, clearSelectedTransactions);

            // Then the default query is the one for expense reports, not for expenses
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: REPORTS_QUERY, searchKey: SEARCH_KEYS.REPORTS}));
        });

        it('should open the last query when it is still valid for the tab', () => {
            // Given a last query that keeps the default filters of the Expenses tab
            const lastQuery = `${EXPENSES_QUERY} merchant:Starbucks`;

            // When we navigate to the tab
            navigateToSpendTab(SEARCH_KEYS.EXPENSES, lastQuery, clearSelectedTransactions);

            // Then the user lands where they left off
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: lastQuery, searchKey: SEARCH_KEYS.EXPENSES}));
        });

        it('should fall back to the default query when the last query is for another type', () => {
            // Given a last query for expense reports left on the Expenses tab
            // When we navigate to the tab
            navigateToSpendTab(SEARCH_KEYS.EXPENSES, REPORTS_QUERY, clearSelectedTransactions);

            // Then the default expenses query opens, since the last one no longer is an expenses search
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: EXPENSES_QUERY, searchKey: SEARCH_KEYS.EXPENSES}));
        });
    });

    describe('navigateToSearch', () => {
        it('should open the query with its name and search key', () => {
            // Given the query, name and key of a saved search
            // When we navigate to it
            navigateToSearch({query: SAVED_QUERY, name: 'Coffee', searchKey: SAVED_SEARCH_KEY});

            // Then the route carries all three and the search context is reset
            expect(setSearchContext).toHaveBeenCalledWith(false);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: SAVED_QUERY, name: 'Coffee', searchKey: SAVED_SEARCH_KEY}));
        });
    });

    describe('navigateToFlatNavItem', () => {
        it('should open the last query stored for a canned search', () => {
            // Given a last query stored for the expenses search
            const lastQuery = `${EXPENSES_QUERY} merchant:Starbucks`;
            const searchFilters: SearchFilters = {[SEARCH_KEYS.EXPENSES]: {query: lastQuery, timestamp: FILTER_TIMESTAMP}};

            // When we navigate to the item
            navigateToFlatNavItem(expensesItem, searchFilters, clearSelectedTransactions);

            // Then that query opens
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: lastQuery, searchKey: SEARCH_KEYS.EXPENSES}));
        });

        it('should open the default query for a canned search without a last query', () => {
            // Given no stored filters
            // When we navigate to the item
            navigateToFlatNavItem(expensesItem, undefined, clearSelectedTransactions);

            // Then the default query opens because there is no prior user query to restore
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: EXPENSES_QUERY, searchKey: SEARCH_KEYS.EXPENSES}));
        });

        it('should fall back to the default query when the stored last query is not valid anymore', () => {
            // Given a stored last query of another type
            const searchFilters: SearchFilters = {[SEARCH_KEYS.EXPENSES]: {query: REPORTS_QUERY, timestamp: FILTER_TIMESTAMP}};

            // When we navigate to the item
            navigateToFlatNavItem(expensesItem, searchFilters, clearSelectedTransactions);

            // Then the default query opens
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: EXPENSES_QUERY, searchKey: SEARCH_KEYS.EXPENSES}));
        });

        it('should open a saved search with its name and key, and clear the selection', () => {
            // Given a saved search
            // When we navigate to it
            navigateToFlatNavItem(createSavedSearchItem(), undefined, clearSelectedTransactions);

            // Then the selection is cleared and the saved query opens under the saved search key
            expect(clearSelectedTransactions).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: SAVED_QUERY, name: 'Coffee', searchKey: SAVED_SEARCH_KEY}));
        });

        it('should prefer the last query the user left a saved search with', () => {
            // Given a last query stored for the saved search, which keeps its type
            const lastQuery = 'type:expense merchant:Starbucks category:Coffee';
            const searchFilters: SearchFilters = {[SAVED_SEARCH_KEY]: {query: lastQuery, timestamp: FILTER_TIMESTAMP}};

            // When we navigate to it
            navigateToFlatNavItem(createSavedSearchItem(), searchFilters, clearSelectedTransactions);

            // Then the stored query opens
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: lastQuery, name: 'Coffee', searchKey: SAVED_SEARCH_KEY}));
        });

        it('should normalize legacy date presets in a saved search query before navigating', () => {
            // Given a saved search containing a legacy year-to-date date filter
            const legacySavedSearch = createSavedSearchItem({
                query: 'type:expense date:year-to-date',
            });

            // When we navigate to it
            navigateToFlatNavItem(legacySavedSearch, undefined, clearSelectedTransactions);

            // Then the legacy preset is normalized to this-year before navigation
            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense sortBy:date sortOrder:desc date:this-year', name: 'Coffee', searchKey: SAVED_SEARCH_KEY}),
            );
        });
    });

    describe('navigateToFlatNavSection', () => {
        it('should open the first item that can be opened', () => {
            // Given a Saved section whose first saved search is pending delete
            const section: FlatNavSection = {
                id: FLAT_NAV.SECTION.SAVED,
                translationPath: 'search.savedSearchesMenuItemTitle',
                iconName: 'Bookmark',
                items: [createSavedSearchItem({savedSearchID: '1', key: savedSearchIDToSearchKey('1'), isDisabled: true}), createSavedSearchItem()],
            };

            // When we navigate to the section
            navigateToFlatNavSection(section, undefined, clearSelectedTransactions);

            // Then the second saved search opens
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: SAVED_QUERY, name: 'Coffee', searchKey: SAVED_SEARCH_KEY}));
        });

        it('should do nothing when the section has no item', () => {
            // Given an empty section
            const section: FlatNavSection = {id: FLAT_NAV.SECTION.EXPENSES, translationPath: 'search.tabs.expenses', iconName: 'Receipt', items: []};

            // When we navigate to it
            navigateToFlatNavSection(section, undefined, clearSelectedTransactions);

            // Then navigation is aborted because the section has no item to open
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(clearSelectedTransactions).not.toHaveBeenCalled();
        });
    });
});
