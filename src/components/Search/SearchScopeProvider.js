"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchContext_1 = require("./SearchContext");
function SearchScopeProvider(_a) {
    var children = _a.children, isOnSearch = _a.isOnSearch;
    var parentContext = (0, SearchContext_1.useSearchContext)();
    var searchContext = (0, react_1.useMemo)(function () { return (__assign(__assign({}, parentContext), { isOnSearch: isOnSearch })); }, [parentContext, isOnSearch]);
    return <SearchContext_1.Context.Provider value={searchContext}>{children}</SearchContext_1.Context.Provider>;
}
exports.default = SearchScopeProvider;
