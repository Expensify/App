import * as SearchUtils from '@libs/SearchUtils';
import type {NavigationPartialRoute} from './types';

function extractPolicyIDFromQuery(route?: NavigationPartialRoute<string>) {
    if (!route?.params) {
        return undefined;
    }

    if (!('q' in route.params)) {
        return undefined;
    }

    const queryString = route.params.q as string;
    const queryJSON = SearchUtils.buildSearchQueryJSON(queryString);
    if (!queryJSON) {
        return undefined;
    }

    return SearchUtils.getPolicyIDFromSearchQuery(queryJSON);
}

export default extractPolicyIDFromQuery;
