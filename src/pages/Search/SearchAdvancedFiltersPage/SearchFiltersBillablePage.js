"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchBooleanFilterBase_1 = require("@components/Search/SearchBooleanFilterBase");
var CONST_1 = require("@src/CONST");
function SearchFiltersBillablePage() {
    return (<SearchBooleanFilterBase_1.default booleanKey={CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE} titleKey="search.filters.billable"/>);
}
SearchFiltersBillablePage.displayName = 'SearchFiltersBillablePage';
exports.default = SearchFiltersBillablePage;
