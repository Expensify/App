import ROUTES from '@src/ROUTES';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {clearQueryRefinement} from './SearchQueryRefinement';

function navigateToSpendSearch(query: string, name?: string) {
    // Opening a search is never a refinement, so a query the filters built earlier must not stay marked and be held
    // later when the same query string arrives from the sidebar or a saved search.
    clearQueryRefinement();

    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name}));
}

function navigateToCannedSpendSearch(searchQuery: string, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    navigateToSpendSearch(searchQuery);
}

export default navigateToCannedSpendSearch;
export {navigateToSpendSearch};
