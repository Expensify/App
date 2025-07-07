"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringUtils_1 = require("./StringUtils");
/**
 * Searches the options and returns sorted results based on the search query
 * @param options - An array of option objects
 * @returns An array of options sorted based on the search query
 */
function searchOptions(searchValue, options) {
    if (!searchValue) {
        return options;
    }
    var trimmedSearchValue = StringUtils_1.default.sanitizeString(searchValue);
    if (!trimmedSearchValue) {
        return [];
    }
    var filteredData = options.filter(function (option) { return option.searchValue.includes(trimmedSearchValue); });
    var halfSorted = filteredData.sort(function (a, b) {
        // Prioritize matches at the beginning of the string
        // e.g. For the search term "Bar" "Barbados" should be prioritized over Antigua & Barbuda
        // The first two characters are the country code, so we start at index 2
        // and end at the length of the search term
        var optionASubstring = a.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        var optionBSubstring = b.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        if (optionASubstring === trimmedSearchValue.toLowerCase()) {
            return -1;
        }
        if (optionBSubstring === trimmedSearchValue.toLowerCase()) {
            return 1;
        }
        return 0;
    });
    var fullSorted;
    var unsanitizedSearchValue = searchValue.toLowerCase().trim();
    if (trimmedSearchValue !== unsanitizedSearchValue) {
        // Diacritic detected, prioritize diacritic matches
        // We search for diacritic matches by using the unsanitized country name and search term
        fullSorted = halfSorted.sort(function (a, b) {
            var unsanitizedOptionA = a.text.toLowerCase();
            var unsanitizedOptionB = b.text.toLowerCase();
            if (unsanitizedOptionA.includes(unsanitizedSearchValue)) {
                return -1;
            }
            if (unsanitizedOptionB.includes(unsanitizedSearchValue)) {
                return 1;
            }
            return 0;
        });
    }
    else {
        // Diacritic not detected, prioritize country code matches (country codes can never contain diacritics)
        // E.g. the search term 'US' should push 'United States' to the top
        fullSorted = halfSorted.sort(function (a, b) {
            if (a.value.toLowerCase() === trimmedSearchValue) {
                return -1;
            }
            if (b.value.toLowerCase() === trimmedSearchValue) {
                return 1;
            }
            return 0;
        });
    }
    return fullSorted;
}
exports.default = searchOptions;
