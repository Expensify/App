/**
 * Resolves the route used to restore the latest Spend search.
 */
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import type {SearchFullscreenNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {NavigationState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

import getLastRoute from './getLastRoute';

function getSearchTabRoute(rootState: NavigationState, lastSearchParams: OnyxEntry<LastSearchParams>) {
    const lastSearchRoute = getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT);

    if (lastSearchRoute) {
        const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
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
    return ROUTES.SEARCH_ROOT.getRoute({query: lastQueryFromOnyx ?? defaultSearchQuery});
}

export default getSearchTabRoute;
