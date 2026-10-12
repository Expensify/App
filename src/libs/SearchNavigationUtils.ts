import ROUTES from '@src/ROUTES';

import type {SearchKey} from './SearchKeyUtils';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey}));
}

/** Opens a search as it was last seen, such as a saved search or one recorded for the More menu. */
function navigateToSearch({query, searchKey, name}: {query: string; searchKey?: SearchKey; name?: string}) {
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name, searchKey}));
}

export default navigateToCannedSpendSearch;
export {navigateToSearch};
