"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubstitutionMapKey = void 0;
exports.getQueryWithSubstitutions = getQueryWithSubstitutions;
var autocompleteParser_1 = require("@libs/SearchParser/autocompleteParser");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var getSubstitutionMapKey = function (filterKey, value) { return "".concat(filterKey, ":").concat(value); };
exports.getSubstitutionMapKey = getSubstitutionMapKey;
/**
 * Given a plaintext query and a SubstitutionMap object, this function will return a transformed query where:
 * - any autocomplete mention in the original query will be substituted with an id taken from `substitutions` object
 * - anything that does not match will stay as is
 *
 * Ex:
 * query: `A from:@johndoe A`
 * substitutions: {
 *     from:@johndoe: 9876
 * }
 * return: `A from:9876 A`
 */
function getQueryWithSubstitutions(changedQuery, substitutions) {
    var parsed = (0, autocompleteParser_1.parse)(changedQuery);
    var searchAutocompleteQueryRanges = parsed.ranges;
    if (searchAutocompleteQueryRanges.length === 0) {
        return changedQuery;
    }
    var resultQuery = changedQuery;
    var lengthDiff = 0;
    for (var _i = 0, searchAutocompleteQueryRanges_1 = searchAutocompleteQueryRanges; _i < searchAutocompleteQueryRanges_1.length; _i++) {
        var range = searchAutocompleteQueryRanges_1[_i];
        var itemKey = getSubstitutionMapKey(range.key, range.value);
        var substitutionEntry = substitutions[itemKey];
        if (substitutionEntry) {
            var substitutionStart = range.start + lengthDiff;
            var substitutionEnd = range.start + range.length;
            substitutionEntry = (0, SearchQueryUtils_1.sanitizeSearchValue)(substitutionEntry);
            // generate new query but substituting "user-typed" value with the entity id/email from substitutions
            resultQuery = resultQuery.slice(0, substitutionStart) + substitutionEntry + changedQuery.slice(substitutionEnd);
            lengthDiff = lengthDiff + substitutionEntry.length - range.length;
        }
    }
    return resultQuery;
}
