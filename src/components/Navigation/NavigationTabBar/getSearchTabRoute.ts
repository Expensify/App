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

    const lastQueryJSON = lastSearchParams?.queryJSON;
    const lastQueryFromOnyx = lastQueryJSON ? buildSearchQueryString(lastQueryJSON) : undefined;
    const defaultSearchQuery = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
    const fallbackSearchQuery = getValidLastQuery(lastExpensesSearchQuery, defaultSearchQuery);
    return ROUTES.SEARCH_ROOT.getRoute({query: lastQueryFromOnyx ?? fallbackSearchQuery});
}

export default getSearchTabRoute;
