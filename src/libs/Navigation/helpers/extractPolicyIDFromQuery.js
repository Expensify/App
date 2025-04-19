
exports.__esModule = true;
const SearchQueryUtils_1 = require('@libs/SearchQueryUtils');

function extractPolicyIDFromQuery(route) {
    if (!(route === null || route === void 0 ? void 0 : route.params)) {
        return undefined;
    }
    if (!('q' in route.params)) {
        return undefined;
    }
    const queryString = route.params.q;
    const queryJSON = SearchQueryUtils_1.buildSearchQueryJSON(queryString);
    if (!queryJSON) {
        return undefined;
    }
    return SearchQueryUtils_1.getPolicyIDFromSearchQuery(queryJSON);
}
exports['default'] = extractPolicyIDFromQuery;
