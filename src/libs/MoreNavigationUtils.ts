import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SaveSearch, SearchFilters} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {SearchTypeMenuItem} from './SearchUIUtils';

import clearSelectedText from './clearSelectedText/clearSelectedText';
import interceptAnonymousUser from './interceptAnonymousUser';
import {getLastVisitedInsightsDashboard, getLastVisitedSearch} from './MoreDestinationHistory';
import Navigation from './Navigation/Navigation';
import {savedSearchIDToSearchKey, searchKeyToSavedSearchID} from './SearchKeyUtils';
import navigateToCannedSpendSearch, {navigateToSearch} from './SearchNavigationUtils';
import {getValidLastQuery} from './SearchQueryUtils';
import {getLastSearchQuery} from './SearchUIUtils';

/**
 * Reopens the search the user last had open inside a More group, with the filters they left on it. Returns false when
 * there is nothing to reopen, including a saved search that has since been deleted.
 */
function reopenLastVisitedSearch(groupID: string, savedSearches: OnyxEntry<SaveSearch>, clearSelectedTransactions: () => void): boolean {
    const search = getLastVisitedSearch(groupID);
    if (!search) {
        return false;
    }
    const savedSearchID = searchKeyToSavedSearchID(search.searchKey);
    if (savedSearchID && !savedSearches?.[savedSearchID]) {
        return false;
    }
    clearSelectedText();
    interceptAnonymousUser(() => {
        clearSelectedTransactions();
        navigateToSearch(search);
    });
    return true;
}

/** Opens a suggested Spend search on the query the user last left it with. */
function openSearchMenuItem(item: SearchTypeMenuItem | undefined, searchFilters: OnyxEntry<SearchFilters>, clearSelectedTransactions: () => void) {
    if (!item) {
        return;
    }
    clearSelectedText();
    interceptAnonymousUser(() => {
        navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
    });
}

/** Opens the first saved search by name, the one listed first under Saved, on the query the user last left it with. */
function openFirstSavedSearch(savedSearches: OnyxEntry<SaveSearch>, searchFilters: OnyxEntry<SearchFilters>, localeCompare: (a: string, b: string) => number) {
    const [savedSearchID, savedSearch] =
        Object.entries(savedSearches ?? {})
            .sort(([, a], [, b]) => localeCompare(a.name, b.name))
            .at(0) ?? [];
    if (!savedSearchID || !savedSearch) {
        return;
    }
    const searchKey = savedSearchIDToSearchKey(savedSearchID);
    clearSelectedText();
    interceptAnonymousUser(() => {
        navigateToSearch({query: getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), savedSearch.query), name: savedSearch.name, searchKey});
    });
}

/** Opens the Insights dashboard the user last looked at, or the Spend dashboard when there is none. */
function openLastInsightsDashboard() {
    clearSelectedText();
    interceptAnonymousUser(() => {
        Navigation.navigate(ROUTES.INSIGHTS.getRoute(getLastVisitedInsightsDashboard() ?? CONST.INSIGHTS.DASHBOARD.SPEND));
    });
}

export {openFirstSavedSearch, openLastInsightsDashboard, openSearchMenuItem, reopenLastVisitedSearch};
