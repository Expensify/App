import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import navigationRef from './Navigation/navigationRef';
import {clearQueryRefinement} from './SearchQueryRefinement';

/**
 * `Navigation.navigate` would push another SEARCH.ROOT route and remount SearchPage, losing anything it was animating,
 * so update the focused route instead. Only valid when SEARCH.ROOT is focused, since the sidebar also shows over reports.
 */
function navigateToSpendSearch(query: string, name?: string) {
    // Opening a search is never a refinement, so a query the filters built earlier must not stay marked and be held
    // later when the same query string arrives from the sidebar or a saved search.
    clearQueryRefinement();

    if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name === SCREENS.SEARCH.ROOT) {
        navigationRef.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {params: {q: query, name, rawQuery: undefined}},
        });
        return;
    }

    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name}));
}

function navigateToCannedSpendSearch(searchQuery: string, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    navigateToSpendSearch(searchQuery);
}

export default navigateToCannedSpendSearch;
export {navigateToSpendSearch};
