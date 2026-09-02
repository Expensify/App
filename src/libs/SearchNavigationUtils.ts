import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import navigationRef from './Navigation/navigationRef';

/**
 * Opens a Spend search, changing the params of the Search screen already on screen where possible.
 *
 * `Navigation.navigate` would push another SEARCH.ROOT route — the reason SearchFullscreenNavigator needs a custom
 * state hook to render from the last one onward — and that remounts SearchPage, losing anything it was animating.
 * PUSH_PARAMS updates the focused route instead and keeps back-navigation through param changes.
 *
 * It only applies when SEARCH.ROOT is the focused route: the sidebar these calls come from is ExtraContent for the
 * whole navigator, so it is also visible over a report, where the params belong to a different route.
 */
function navigateToSpendSearch(query: string, name?: string) {
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
