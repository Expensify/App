import type {NavigationPartialRoute} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';

function extractPolicyIDFromQuery(route?: NavigationPartialRoute<string>) {
    if (!route?.params) {
        return undefined;
    }

    if (!('q' in route.params)) {
        return undefined;
    }

    const queryString = route.params.q as string;
    const queryJSON = SearchQueryUtils.buildSearchQueryJSON(queryString);
    if (!queryJSON) {
        return undefined;
    }

    return SearchQueryUtils.getPolicyIDFromSearchQuery(queryJSON);
}

export default extractPolicyIDFromQuery;
