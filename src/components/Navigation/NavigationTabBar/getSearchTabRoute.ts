/**
 * Resolves the route used to restore the latest Spend search.
 */
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString, getValidLastQuery, isSearchRootParams} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {NavigationState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

import getLastRoute from './getLastRoute';

/** The latest Spend search kept in Onyx, for a Spend tab that has not shown a search yet. */
function getStoredSearchTabParams(lastSearchParams: OnyxEntry<LastSearchParams>, lastExpensesSearchQuery: string | undefined) {
    const lastQueryJSON = lastSearchParams?.queryJSON;
    const lastQueryFromOnyx = lastQueryJSON ? buildSearchQueryString(lastQueryJSON) : undefined;
    if (lastQueryFromOnyx) {
        // The persisted search key belongs to the persisted query, so it only travels with it.
        return {query: lastQueryFromOnyx, searchKey: lastSearchParams?.searchKey};
    }

    const defaultSearchQuery = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
    return {query: getValidLastQuery(lastExpensesSearchQuery, defaultSearchQuery), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES};
}

function getSearchTabRoute(rootState: NavigationState, lastSearchParams: OnyxEntry<LastSearchParams>, lastExpensesSearchQuery: string | undefined) {
    const lastSearchRoute = getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT);

    if (isSearchRootParams(lastSearchRoute?.params)) {
        const {q, ...rest} = lastSearchRoute.params;
        const queryJSON = buildSearchQueryJSON(q);
        if (queryJSON) {
            return ROUTES.SEARCH_ROOT.getRoute({
                query: buildSearchQueryString(queryJSON),
                ...rest,
            });
        }
    }

    return ROUTES.SEARCH_ROOT.getRoute(getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery));
}

export default getSearchTabRoute;
export {getStoredSearchTabParams};
