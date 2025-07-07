"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = tokenizedSearch;
var CONST_1 = require("@src/CONST");
/**
 * Tokenized search utility function
 * @param items - Array of items to search through
 * @param searchValue - The search term
 * @param getTextTokens - A function that returns an array of text tokens for each item
 * @returns Filtered array of items that match the search term
 */
function tokenizedSearch(items, searchValue, getTextTokens) {
    var trimmedSearch = searchValue.trim();
    if (!trimmedSearch) {
        return items;
    }
    var searchTokens = trimmedSearch.toLowerCase().split(CONST_1.default.REGEX.WHITESPACE).filter(Boolean);
    return items.filter(function (item) {
        var normalizedTokens = [];
        for (var _i = 0, _a = getTextTokens(item); _i < _a.length; _i++) {
            var rawToken = _a[_i];
            var lowerToken = rawToken.toLowerCase();
            for (var _b = 0, _c = lowerToken.split(CONST_1.default.REGEX.WHITESPACE); _b < _c.length; _b++) {
                var splitToken = _c[_b];
                if (splitToken) {
                    normalizedTokens.push(splitToken);
                }
            }
        }
        for (var _d = 0, searchTokens_1 = searchTokens; _d < searchTokens_1.length; _d++) {
            var searchToken = searchTokens_1[_d];
            var matchFound = false;
            for (var _e = 0, normalizedTokens_1 = normalizedTokens; _e < normalizedTokens_1.length; _e++) {
                var textToken = normalizedTokens_1[_e];
                if (textToken.includes(searchToken)) {
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                return false;
            }
        }
        return true;
    });
}
