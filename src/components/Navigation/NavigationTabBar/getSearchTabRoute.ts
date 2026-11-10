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

type SearchTabRouteParams = Parameters<typeof ROUTES.SEARCH_ROOT.getRoute>[0];

/** The params of the route the Spend tab opens. The idle tab preload mounts the tab with these, so a tap reveals that same screen. */
function getSearchTabRouteParams(rootState: NavigationState, lastSearchParams: OnyxEntry<LastSearchParams>, lastExpensesSearchQuery: string | undefined): SearchTabRouteParams {
    const lastSearchRoute = getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT);

    if (isSearchRootParams(lastSearchRoute?.params)) {
        const {q, ...rest} = lastSearchRoute.params;
        const queryJSON = buildSearchQueryJSON(q);
        if (queryJSON) {
            return {
                query: buildSearchQueryString(queryJSON),
                ...rest,
            };
        }
    }

    return getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery);
}

function getSearchTabRoute(rootState: NavigationState, lastSearchParams: OnyxEntry<LastSearchParams>, lastExpensesSearchQuery: string | undefined) {
    return ROUTES.SEARCH_ROOT.getRoute(getSearchTabRouteParams(rootState, lastSearchParams, lastExpensesSearchQuery));
}

export default getSearchTabRoute;
export {getSearchTabRouteParams, getStoredSearchTabParams};
