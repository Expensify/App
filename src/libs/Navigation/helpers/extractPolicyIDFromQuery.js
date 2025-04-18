"use strict";
exports.__esModule = true;
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
function extractPolicyIDFromQuery(route) {
    if (!(route === null || route === void 0 ? void 0 : route.params)) {
        return undefined;
    }
    if (!('q' in route.params)) {
        return undefined;
    }
    var queryString = route.params.q;
    var queryJSON = SearchQueryUtils_1.buildSearchQueryJSON(queryString);
    if (!queryJSON) {
        return undefined;
    }
    return SearchQueryUtils_1.getPolicyIDFromSearchQuery(queryJSON);
}
exports["default"] = extractPolicyIDFromQuery;
