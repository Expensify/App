
exports.__esModule = true;
exports.MATCH_RANK = void 0;
const MATCH_RANK = {
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
    const lowercaseTestString = testString.toLowerCase();
    const lowercaseStringToRank = stringToRank.toLowerCase();
    // case insensitive equals
    if (lowercaseTestString === lowercaseStringToRank) {
        return MATCH_RANK.EQUAL;
    }
    // starts with
    if (lowercaseTestString.startsWith(lowercaseStringToRank)) {
        return MATCH_RANK.STARTS_WITH;
    }
    // word starts with
    if (lowercaseTestString.includes(` ${  lowercaseStringToRank}`)) {
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
    let matchingInOrderCharCount = 0;
    let charNumber = 0;
    for (let _i = 0, stringToRank_1 = stringToRank; _i < stringToRank_1.length; _i++) {
        const char = stringToRank_1[_i];
        charNumber = lowercaseTestString.indexOf(char, charNumber) + 1;
        if (!charNumber) {
            return MATCH_RANK.NO_MATCH;
        }
        matchingInOrderCharCount++;
    }
    // Calculate ranking based on character sequence and spread
    const spread = charNumber - lowercaseTestString.indexOf(stringToRank[0]);
    const spreadPercentage = 1 / spread;
    const inOrderPercentage = matchingInOrderCharCount / stringToRank.length;
    const ranking = MATCH_RANK.MATCHES + inOrderPercentage * spreadPercentage;
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
    const filteredItems = [];
    for (let _i = 0, items_1 = items; _i < items_1.length; _i++) {
        const item = items_1[_i];
        const valuesToRank = extractRankableValuesFromItem(item);
        let itemRank = MATCH_RANK.NO_MATCH;
        for (let _a = 0, valuesToRank_1 = valuesToRank; _a < valuesToRank_1.length; _a++) {
            const value = valuesToRank_1[_a];
            const rank = getMatchRanking(value, searchValue);
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
