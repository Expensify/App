import {buildSearchQueryJSON, getPolicyIDFromSearchQuery} from '@libs/SearchQueryUtils';
import type {NavigationPartialRoute} from './types';

function extractPolicyIDFromQuery(route?: NavigationPartialRoute<string>) {
    if (!route?.params) {
        return undefined;
    }

    if (!('q' in route.params)) {
        return undefined;
    }

    const queryString = route.params.q as string;
    const queryJSON = buildSearchQueryJSON(queryString);
    if (!queryJSON) {
        return undefined;
    }

    return getPolicyIDFromSearchQuery(queryJSON);
}

export default extractPolicyIDFromQuery;
