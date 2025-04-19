'use strict';
exports.__esModule = true;
exports.MATCH_RANK = void 0;
var MATCH_RANK = {
    CASE_SENSITIVE_EQUAL: 6,
    EQUAL: 5,
    STARTS_WITH: 4,
    WORD_STARTS_WITH: 3,
    CONTAINS: 2,
    MATCHES: 1,
    NO_MATCH: 0,
};
exports.MATCH_RANK = MATCH_RANK;
/**
 * Gives a rankings score based on how well the two strings match.
 * @param testString - the string to test against
 * @param stringToRank - the string to rank
 * @returns the ranking for how well stringToRank matches testString
 */
function getMatchRanking(testString, stringToRank) {
    // too long
    if (stringToRank.length > testString.length) {
        return MATCH_RANK.NO_MATCH;
    }
    // case sensitive equals
    if (testString === stringToRank) {
        return MATCH_RANK.CASE_SENSITIVE_EQUAL;
    }
    // Lower casing before further comparison
    var lowercaseTestString = testString.toLowerCase();
    var lowercaseStringToRank = stringToRank.toLowerCase();
    // case insensitive equals
    if (lowercaseTestString === lowercaseStringToRank) {
        return MATCH_RANK.EQUAL;
    }
    // starts with
    if (lowercaseTestString.startsWith(lowercaseStringToRank)) {
        return MATCH_RANK.STARTS_WITH;
    }
    // word starts with
    if (lowercaseTestString.includes(' ' + lowercaseStringToRank)) {
        return MATCH_RANK.WORD_STARTS_WITH;
    }
    // contains
    if (lowercaseTestString.includes(lowercaseStringToRank)) {
        return MATCH_RANK.CONTAINS;
    }
    if (lowercaseStringToRank.length === 1) {
        return MATCH_RANK.NO_MATCH;
    }
    // will return a number between rankings.MATCHES and rankings.MATCHES + 1 depending  on how close of a match it is.
    var matchingInOrderCharCount = 0;
    var charNumber = 0;
    for (var _i = 0, stringToRank_1 = stringToRank; _i < stringToRank_1.length; _i++) {
        var char = stringToRank_1[_i];
        charNumber = lowercaseTestString.indexOf(char, charNumber) + 1;
        if (!charNumber) {
            return MATCH_RANK.NO_MATCH;
        }
        matchingInOrderCharCount++;
    }
    // Calculate ranking based on character sequence and spread
    var spread = charNumber - lowercaseTestString.indexOf(stringToRank[0]);
    var spreadPercentage = 1 / spread;
    var inOrderPercentage = matchingInOrderCharCount / stringToRank.length;
    var ranking = MATCH_RANK.MATCHES + inOrderPercentage * spreadPercentage;
    return ranking;
}
/**
 * Takes an array of items and a value and returns a new array with the items that match the given value
 * @param items - the items to filter
 * @param searchValue - the value to use for ranking
 * @param extractRankableValuesFromItem - an array of functions
 * @returns the new filtered array
 */
function filterArrayByMatch(items, searchValue, extractRankableValuesFromItem) {
    var filteredItems = [];
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var valuesToRank = extractRankableValuesFromItem(item);
        var itemRank = MATCH_RANK.NO_MATCH;
        for (var _a = 0, valuesToRank_1 = valuesToRank; _a < valuesToRank_1.length; _a++) {
            var value = valuesToRank_1[_a];
            var rank = getMatchRanking(value, searchValue);
            if (rank > itemRank) {
                itemRank = rank;
            }
        }
        if (itemRank >= MATCH_RANK.MATCHES + 1) {
            filteredItems.push(item);
        }
    }
    return filteredItems;
}
exports['default'] = filterArrayByMatch;
