"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdatedSubstitutionsMap = getUpdatedSubstitutionsMap;
var autocompleteParser_1 = require("@libs/SearchParser/autocompleteParser");
var getSubstitutionsKey = function (filterKey, value) { return "".concat(filterKey, ":").concat(value); };
/**
 * Given a plaintext query and a SubstitutionMap object,
 * this function will remove any substitution keys that do not appear in the query and return an updated object
 *
 * Ex:
 * query: `Test from:John1`
 * substitutions: {
 *     from:SomeOtherJohn: 12345
 * }
 * return: {}
 */
function getUpdatedSubstitutionsMap(query, substitutions) {
    var parsedQuery = (0, autocompleteParser_1.parse)(query);
    var searchAutocompleteQueryRanges = parsedQuery.ranges;
    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }
    var autocompleteQueryKeys = searchAutocompleteQueryRanges.map(function (range) { return getSubstitutionsKey(range.key, range.value); });
    // Build a new substitutions map consisting of only the keys from old map, that appear in query
    var updatedSubstitutionMap = autocompleteQueryKeys.reduce(function (map, key) {
        if (substitutions[key]) {
            // eslint-disable-next-line no-param-reassign
            map[key] = substitutions[key];
        }
        return map;
    }, {});
    return updatedSubstitutionMap;
}
