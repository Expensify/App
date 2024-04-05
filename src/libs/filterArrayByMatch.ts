/**
 * This file is a slim version of match-sorter library (https://github.com/kentcdodds/match-sorter) adjusted to the needs.
   Use `threshold` option with one of the rankings defined below to control the strictness of the match.
*/
import type {ValueOf} from 'type-fest';
import StringUtils from './StringUtils';

const MATCH_RANK = {
    CASE_SENSITIVE_EQUAL: 7,
    EQUAL: 6,
    STARTS_WITH: 5,
    WORD_STARTS_WITH: 4,
    CONTAINS: 3,
    ACRONYM: 2,
    MATCHES: 1,
    NO_MATCH: 0,
} as const;

type Ranking = ValueOf<typeof MATCH_RANK>;

type RankingInfo = {
    rankedValue: string;
    rank: Ranking;
    keyIndex: number;
    keyThreshold?: Ranking;
};

type ValueGetterKey<T> = (item: T) => string | string[];

type KeyAttributesOptions<T> = {
    key: string | ValueGetterKey<T>;
    threshold?: Ranking;
};

type KeyOption<T> = KeyAttributesOptions<T> | ValueGetterKey<T> | string;

type Options<T = unknown> = {
    keys: ReadonlyArray<KeyOption<T>>;
    threshold?: Ranking;
};
type IndexableByString = Record<string, unknown>;

/**
 * Gets value for key in item at arbitrarily nested keypath
 * @param item - the item
 * @param key - the potentially nested keypath or property callback
 * @returns an array containing the value(s) at the nested keypath
 */
function getItemValues<T>(item: T, key: KeyOption<T>): string[] {
    if (!item) {
        return [];
    }

    const resolvedKey = typeof key === 'object' ? key.key : key;
    const value = typeof resolvedKey === 'function' ? resolvedKey(item) : (item as IndexableByString)[resolvedKey];

    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value.map(String) : [String(value)];
}

/**
 * Gets all the values for the given keys in the given item and returns an array of those values
 * @param item - the item from which the values will be retrieved
 * @param keys - the keys to use to retrieve the values
 * @return objects with {itemValue}
 */
function getAllValuesToRank<T>(item: T, keys: ReadonlyArray<KeyOption<T>>): string[] {
    return keys.flatMap((key) => getItemValues(item, key));
}

/**
 * Gives a rankings score based on how well the two strings match.
 * @param testString - the string to test against
 * @param stringToRank - the string to rank
 * @returns the ranking for how well stringToRank matches testString
 */
function getMatchRanking(testString: string, stringToRank: string): Ranking {
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
    if (lowercaseTestString.includes(` ${lowercaseStringToRank}`)) {
        return MATCH_RANK.WORD_STARTS_WITH;
    }

    // contains
    if (lowercaseTestString.includes(lowercaseStringToRank)) {
        return MATCH_RANK.CONTAINS;
    }
    if (lowercaseStringToRank.length === 1) {
        return MATCH_RANK.NO_MATCH;
    }

    // acronym
    if (StringUtils.getAcronym(lowercaseTestString).includes(lowercaseStringToRank)) {
        return MATCH_RANK.ACRONYM;
    }

    // will return a number between rankings.MATCHES and rankings.MATCHES + 1 depending  on how close of a match it is.
    let matchingInOrderCharCount = 0;
    let charNumber = 0;
    for (const char of stringToRank) {
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

    return ranking as Ranking;
}

/**
 * Gets the highest ranking for value for the given item based on its values for the given keys
 * @param item - the item to rank
 * @param keys - the keys to get values from the item for the ranking
 * @param value - the value to rank against
 * @param options - options to control the ranking
 * @returns the highest ranking
 */
function getHighestRanking<T>(item: T, keys: ReadonlyArray<KeyOption<T>>, value: string, options: Options<T>): RankingInfo {
    const valuesToRank = getAllValuesToRank(item, keys);
    return valuesToRank.reduce(
        (acc, itemValue, index) => {
            const ranking = acc;
            const newRank = getMatchRanking(itemValue, value);
            let newRankedValue = ranking.rankedValue;

            if (newRank > ranking.rank) {
                ranking.rank = newRank;
                ranking.keyIndex = index;
                ranking.keyThreshold = options.threshold;
                newRankedValue = itemValue;
            }
            return {rankedValue: newRankedValue, rank: ranking.rank, keyIndex: ranking.keyIndex, keyThreshold: ranking.keyThreshold};
        },
        {
            rankedValue: item as unknown as string,
            rank: MATCH_RANK.NO_MATCH as Ranking,
            keyIndex: -1,
            keyThreshold: options.threshold,
        },
    );
}

/**
 * Takes an array of items and a value and returns a new array with the items that match the given value
 * @param items - the items to filter
 * @param searchValue - the value to use for ranking
 * @param options - options to configure
 * @returns the new filtered array
 */
function filterArrayByMatch<T = string>(items: readonly T[], searchValue: string, options: Options<T>): T[] {
    const {keys, threshold = MATCH_RANK.MATCHES} = options;

    return items
        .map((item) => ({...getHighestRanking(item, keys, searchValue, options), item}))
        .filter(({rank, keyThreshold = threshold}) => rank >= Math.max(keyThreshold, threshold + 1))
        .map(({item}) => item);
}

export default filterArrayByMatch;
export {MATCH_RANK};

export type {Options, KeyAttributesOptions, KeyOption, RankingInfo, ValueGetterKey};
