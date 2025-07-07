"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchDatePresetFilterBase_1 = require("@components/Search/SearchDatePresetFilterBase");
var CONST_1 = require("@src/CONST");
function SearchFiltersApprovedPage() {
    return (<SearchDatePresetFilterBase_1.default dateKey={CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.APPROVED} titleKey="search.filters.approved"/>);
}
SearchFiltersApprovedPage.displayName = 'SearchFiltersApprovedPage';
exports.default = SearchFiltersApprovedPage;
