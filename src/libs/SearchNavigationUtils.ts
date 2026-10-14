import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {SearchKey} from './SearchKeyUtils';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {buildCannedSearchQuery, getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey}));
}

/** The Spend searches that have a tab of their own on narrow layouts. Every user has both. */
type SpendTabSearchKey = typeof CONST.SEARCH.SEARCH_KEYS.EXPENSES | typeof CONST.SEARCH.SEARCH_KEYS.REPORTS;

/** Opens the Expenses or Reports tab on the query the user last left it with. */
function navigateToSpendTab(searchKey: SpendTabSearchKey, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    const searchQuery = buildCannedSearchQuery(searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} : undefined);
    navigateToCannedSpendSearch(searchKey, searchQuery, lastSearchQuery, clearSelectedTransactions);
}

/** Opens a search as it was last seen, such as a saved search or one recorded for the More menu. */
function navigateToSearch({query, searchKey, name}: {query: string; searchKey?: SearchKey; name?: string}) {
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name, searchKey}));
}

export default navigateToCannedSpendSearch;
export {navigateToSearch, navigateToSpendTab};
export type {SpendTabSearchKey};
