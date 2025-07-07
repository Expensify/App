"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchDatePresetFilterBase_1 = require("@components/Search/SearchDatePresetFilterBase");
var useEnvironment_1 = require("@hooks/useEnvironment");
var CONST_1 = require("@src/CONST");
function SearchFiltersPostedPage() {
    var isDevelopment = (0, useEnvironment_1.default)().isDevelopment;
    // s77rt remove DEV lock
    var presets = isDevelopment ? [CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] : undefined;
    return (<SearchDatePresetFilterBase_1.default dateKey={CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.POSTED} titleKey="search.filters.posted" presets={presets}/>);
}
SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';
exports.default = SearchFiltersPostedPage;
