"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSubstitutionsMap = buildSubstitutionsMap;
var autocompleteParser_1 = require("@libs/SearchParser/autocompleteParser");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var CONST_1 = require("@src/CONST");
var getSubstitutionsKey = function (filterKey, value) { return "".concat(filterKey, ":").concat(value); };
/**
 * Given a plaintext query and specific entities data,
 * this function will build the substitutions map from scratch for this query
 *
 * Ex:
 * query: `Test from:12345 to:9876`
 * personalDetails: {
 *     12345: JohnDoe
 *     98765: SomeoneElse
 * }
 *
 * return: {
 *     from:JohnDoe: 12345,
 *     to:SomeoneElse: 98765,
 * }
 */
function buildSubstitutionsMap(query, personalDetails, reports, allTaxRates, cardList, cardFeedNamesWithType, policies) {
    var parsedQuery = (0, autocompleteParser_1.parse)(query);
    var searchAutocompleteQueryRanges = parsedQuery.ranges;
    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }
    var substitutionsMap = searchAutocompleteQueryRanges.reduce(function (map, range) {
        var filterKey = range.key, filterValue = range.value;
        if (filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            var taxRateID_1 = filterValue;
            var taxRates = Object.entries(allTaxRates)
                .filter(function (_a) {
                var IDs = _a[1];
                return IDs.includes(taxRateID_1);
            })
                .map(function (_a) {
                var name = _a[0];
                return name;
            });
            var taxRateNames = taxRates.length > 0 ? taxRates : [taxRateID_1];
            var uniqueTaxRateNames = __spreadArray([], new Set(taxRateNames), true);
            uniqueTaxRateNames.forEach(function (taxRateName) {
                var substitutionKey = getSubstitutionsKey(filterKey, taxRateName);
                // eslint-disable-next-line no-param-reassign
                map[substitutionKey] = taxRateID_1;
            });
        }
        else if (filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TO ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.IN ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAG ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FEED ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER ||
            filterKey === CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.PAYER) {
            var displayValue = (0, SearchQueryUtils_1.getFilterDisplayValue)(filterKey, filterValue, personalDetails, reports, cardList, cardFeedNamesWithType, policies);
            // If displayValue === filterValue, then it means there is nothing to substitute, so we don't add any key to map
            if (displayValue !== filterValue) {
                var substitutionKey = getSubstitutionsKey(filterKey, displayValue);
                // eslint-disable-next-line no-param-reassign
                map[substitutionKey] = filterValue;
            }
        }
        return map;
    }, {});
    return substitutionsMap;
}
