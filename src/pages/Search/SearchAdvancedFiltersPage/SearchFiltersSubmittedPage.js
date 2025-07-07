"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchDatePresetFilterBase_1 = require("@components/Search/SearchDatePresetFilterBase");
var CONST_1 = require("@src/CONST");
function SearchFiltersSubmittedPage() {
    return (<SearchDatePresetFilterBase_1.default dateKey={CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED} titleKey="search.filters.submitted"/>);
}
SearchFiltersSubmittedPage.displayName = 'SearchFiltersSubmittedPage';
exports.default = SearchFiltersSubmittedPage;
