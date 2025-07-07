"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
/**
 * Hook to manage search state based on route parameters
 * Returns search status and hash for query tracking
 */
var useSearchState = function () {
    var _a;
    // We are using these contexts directly instead of useRoute, because those will throw an error if used outside a navigator.
    var route = (0, react_1.useContext)(native_1.NavigationRouteContext);
    var _b = (_a = route === null || route === void 0 ? void 0 : route.params) !== null && _a !== void 0 ? _a : {}, q = _b.q, type = _b.type, hashKeyFromRoute = _b.hashKey;
    return (0, react_1.useMemo)(function () {
        if (!route) {
            return { isOnSearch: false, hashKey: undefined };
        }
        var isSearchAttachmentModal = (route === null || route === void 0 ? void 0 : route.name) === SCREENS_1.default.ATTACHMENTS && type === CONST_1.default.ATTACHMENT_TYPE.SEARCH;
        var queryJSON = q ? (0, SearchQueryUtils_1.buildSearchQueryJSON)(q) : {};
        // for attachment modal the hashKey is passed through route params, fallback to it if not found in queryJSON
        var hashKey = (queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.hash) ? queryJSON.hash : (hashKeyFromRoute !== null && hashKeyFromRoute !== void 0 ? hashKeyFromRoute : undefined);
        var isOnSearch = ((route === null || route === void 0 ? void 0 : route.name) === SCREENS_1.default.SEARCH.ROOT && !!hashKey) || isSearchAttachmentModal;
        return { hashKey: hashKey, isOnSearch: isOnSearch };
    }, [q, type, route, hashKeyFromRoute]);
};
exports.default = useSearchState;
