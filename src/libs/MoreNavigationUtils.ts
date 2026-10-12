import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SaveSearch} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import clearSelectedText from './clearSelectedText/clearSelectedText';
import interceptAnonymousUser from './interceptAnonymousUser';
import {getLastVisitedInsightsDashboard, getLastVisitedSearch} from './MoreDestinationHistory';
import Navigation from './Navigation/Navigation';
import {searchKeyToSavedSearchID} from './SearchKeyUtils';
import {navigateToSearch} from './SearchNavigationUtils';

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

/** Opens the Insights dashboard the user last looked at, or the Spend dashboard when there is none. */
function openLastInsightsDashboard() {
    clearSelectedText();
    interceptAnonymousUser(() => {
        Navigation.navigate(ROUTES.INSIGHTS.getRoute(getLastVisitedInsightsDashboard() ?? CONST.INSIGHTS.DASHBOARD.SPEND));
    });
}

export {openLastInsightsDashboard, reopenLastVisitedSearch};
