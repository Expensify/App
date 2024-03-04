const rankings = {
    CASE_SENSITIVE_EQUAL: 7,
    EQUAL: 6,
    STARTS_WITH: 5,
    WORD_STARTS_WITH: 4,
    CONTAINS: 3,
    ACRONYM: 2,
    MATCHES: 1,
    NO_MATCH: 0,
} as const;

const sortType = {
    ASC: 'asc',
    DESC: 'desc',
    NONE: 'none',
} as const;

type Ranking = (typeof rankings)[keyof typeof rankings];
type Sort = (typeof sortType)[keyof typeof sortType];

type RankingInfo = {
    rankedValue: string;
    rank: Ranking;
    keyIndex: number;
    keyThreshold: Ranking | undefined;
};

type ValueGetterKey<T> = (item: T) => string | string[];

type IndexedItem<T> = {
    item: T;
    index: number;
};
type RankedItem<T> = RankingInfo & IndexedItem<T>;

type KeyAttributesOptions<T> = {
    key?: string | ValueGetterKey<T>;
    threshold?: Ranking;
};

type KeyOption<T> = KeyAttributesOptions<T> | ValueGetterKey<T> | string;

type Options<T = unknown> = {
    keys?: ReadonlyArray<KeyOption<T>>;
    threshold?: Ranking;
    sort?: Sort;
    strict?: boolean;
};
type IndexableByString = Record<string, unknown>;

/**
 * Sorts the ranked items based on the sort type
 * @param rankedItems list of ranked items
 * @param sort sort type
 * @returns the sorted list of items
 */
function sortRankedItems<T>(rankedItems: RankedItem<T>[], sort: Sort): T[] {
    if (sort === sortType.DESC) {
        return rankedItems.sort((a, b) => b.rank - a.rank).map((item) => item.item);
    }

    if (sort === sortType.ASC) {
        return rankedItems.sort((a, b) => a.rank - b.rank).map((item) => item.item);
    }

    return rankedItems.map((item) => item.item);
}

/**
 * Generates an acronym for a string.
 *
 * @param {String} string the string for which to produce the acronym
 * @returns {String} the acronym
 */
function getAcronym(string: string): string {
    let acronym = '';
    const wordsInString = string.split(' ');
    wordsInString.forEach((wordInString) => {
        const splitByHyphenWords = wordInString.split('-');
        splitByHyphenWords.forEach((splitByHyphenWord) => {
            acronym += splitByHyphenWord.substring(0, 1);
        });
    });
    return acronym;
}

/**
 * Given path: "foo.bar.baz" and item: {foo: {bar: {baz: 'buzz'}}} -> 'buzz'
 * @param path a dot-separated set of keys
 * @param item the item to get the value from
 */
function getNestedValues<T>(path: string, item: T): string[] {
    const keys = path.split('.');

    type ValueA = Array<T | IndexableByString | string>;
    let values: ValueA = [item];

    for (let i = 0; i < keys.length; i++) {
        const nestedKey = keys[i];
        let nestedValues: ValueA = [];

        for (let j = 0; j < values.length; j++) {
            const nestedItem = values[j];

            if (nestedItem == null) continue;

            if (Object.hasOwnProperty.call(nestedItem, nestedKey)) {
                const nestedValue = (nestedItem as IndexableByString)[nestedKey];
                if (nestedValue != null) {
                    nestedValues.push(nestedValue as IndexableByString | string);
                }
            } else if (nestedKey === '*') {
                // ensure that values is an array
                nestedValues = nestedValues.concat(nestedItem);
            }
        }

        values = nestedValues;
    }

    if (Array.isArray(values[0])) {
        // keep allowing the implicit wildcard for an array of strings at the end of the path
        const result: string[] = [];
        return result.concat(...(values as string[]));
    }

    return values as string[];
}

/**
 * Gets value for key in item at arbitrarily nested keypath
 * @param {Object} item - the item
 * @param {Object|Function} key - the potentially nested keypath or property callback
 * @return {Array} - an array containing the value(s) at the nested keypath
 */
function getItemValues<T>(item: T, key: KeyOption<T>): string[] {
    if (typeof key === 'object') {
        key = key.key as string;
    }
    let value: string | string[] | null | unknown;
    if (typeof key === 'function') {
        value = key(item);
    } else if (item == null) {
        value = null;
    } else if (Object.hasOwnProperty.call(item, key)) {
        value = (item as IndexableByString)[key];
    } else if (key.includes('.')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return getNestedValues<T>(key, item);
    } else {
        value = null;
    }

    // because `value` can also be undefined
    if (value == null) {
        return [];
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [String(value)];
}

/**
 * Gets all the values for the given keys in the given item and returns an array of those values
 * @param item - the item from which the values will be retrieved
 * @param keys - the keys to use to retrieve the values
 * @return objects with {itemValue}
 */
function getAllValuesToRank<T>(item: T, keys: ReadonlyArray<KeyOption<T>>) {
    const allValues: string[] = [];
    for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const itemValues = getItemValues(item, key);
        for (let i = 0; i < itemValues.length; i++) {
            allValues.push(itemValues[i]);
        }
    }
    return allValues;
}

/**
 * Returns a score based on how spread apart the characters from the stringToRank are within the testString.
 * A number close to rankings.MATCHES represents a loose match. A number close to rankings.MATCHES + 1 represents a tighter match.
 * @param {String} testString - the string to test against
 * @param {String} stringToRank - the string to rank
 * @returns {Number} the number between rankings.MATCHES and
 */
function getClosenessRanking(testString: string, stringToRank: string): Ranking {
    let matchingInOrderCharCount = 0;
    let charNumber = 0;
    function findMatchingCharacter(matchChar: string, string: string, index: number) {
        for (let j = index; j < string.length; j++) {
            if (string[j] === matchChar) {
                matchingInOrderCharCount += 1;
                return j + 1;
            }
        }
        return -1;
    }

    function getRanking(spread: number) {
        const spreadPercentage = 1 / spread;
        const inOrderPercentage = matchingInOrderCharCount / stringToRank.length;
        const ranking = rankings.MATCHES + inOrderPercentage * spreadPercentage;

        return ranking as Ranking;
    }

    const firstIndex = findMatchingCharacter(stringToRank[0], testString, 0);

    if (firstIndex < 0) {
        return rankings.NO_MATCH;
    }

    charNumber = firstIndex;
    for (let i = 1; i < stringToRank.length; i++) {
        const matchChar = stringToRank[i];
        charNumber = findMatchingCharacter(matchChar, testString, charNumber);
        const found = charNumber > -1;

        if (!found) {
            return rankings.NO_MATCH;
        }
    }

    const spread = charNumber - firstIndex;
    return getRanking(spread);
}

/**
 * Gives a rankings score based on how well the two strings match.
 * @param {String} testString - the string to test against
 * @param {String} stringToRank - the string to rank
 * @returns {Number} the ranking for how well stringToRank matches testString
 */
function getMatchRanking(testString: string, stringToRank: string): Ranking {
    // too long
    if (stringToRank.length > testString.length) {
        return rankings.NO_MATCH;
    }

    // case sensitive equals
    if (testString === stringToRank) {
        return rankings.CASE_SENSITIVE_EQUAL;
    }

    // Lower casing before further comparison
    const lowercaseTestString = testString.toLowerCase();
    const lowercaseStringToRank = stringToRank.toLowerCase();

    // case insensitive equals
    if (lowercaseTestString === lowercaseStringToRank) {
        return rankings.EQUAL;
    }

    // starts with
    if (lowercaseTestString.startsWith(lowercaseStringToRank)) {
        return rankings.STARTS_WITH;
    }

    // word starts with
    if (lowercaseTestString.includes(` ${lowercaseStringToRank}`)) {
        return rankings.WORD_STARTS_WITH;
    }

    // contains
    if (lowercaseTestString.includes(lowercaseStringToRank)) {
        return rankings.CONTAINS;
    } else if (lowercaseStringToRank.length === 1) {
        // If the only character in the given stringToRank
        //   isn't even contained in the testString, then
        //   it's definitely not a match.
        return rankings.NO_MATCH;
    }

    // acronym
    if (getAcronym(lowercaseTestString).includes(lowercaseStringToRank)) {
        return rankings.ACRONYM;
    }

    // will return a number between rankings.MATCHES and
    // rankings.MATCHES + 1 depending  on how close of a match it is.
    return getClosenessRanking(lowercaseTestString, lowercaseStringToRank);
}

/**
 * Gets the highest ranking for value for the given item based on its values for the given keys
 * @param {*} item - the item to rank
 * @param {Array} keys - the keys to get values from the item for the ranking
 * @param {String} value - the value to rank against
 * @param {Object} options - options to control the ranking
 * @return {{rank: Number, keyIndex: Number, keyThreshold: Number}} - the highest ranking
 */
function getHighestRanking<T>(item: T, keys: ReadonlyArray<KeyOption<T>> | undefined, value: string, options: Options<T>): RankingInfo {
    if (!keys) {
        // if keys is not specified, then we assume the item given is ready to be matched
        const stringItem = item as unknown as string;
        return {
            // ends up being duplicate of 'item' in matches but consistent
            rankedValue: stringItem,
            rank: rankings.NO_MATCH, // TODO fix it
            keyIndex: -1,
            keyThreshold: options.threshold,
        };
    }
    const valuesToRank = getAllValuesToRank(item, keys);
    return valuesToRank.reduce(
        ({rank, rankedValue, keyIndex, keyThreshold}, itemValue, i) => {
            let newRank = getMatchRanking(itemValue, value);
            let newRankedValue = rankedValue;

            if (newRank > rank) {
                rank = newRank;
                keyIndex = i;
                keyThreshold = options.threshold; // TODO check if it's correct
                newRankedValue = itemValue;
            }
            return {rankedValue: newRankedValue, rank, keyIndex, keyThreshold};
        },
        {
            rankedValue: item as unknown as string,
            rank: rankings.NO_MATCH as Ranking,
            keyIndex: -1,
            keyThreshold: options.threshold,
        },
    );
}

/**
 * Takes an array of items and a value and returns a new array with the items that match the given value
 * @param {Array} items - the items to filter
 * @param {String} searchValue - the value to use for ranking
 * @param {Object} options - options to configure
 * @return {Array} - the new sorted array
 */
function filterArrayByMatch<T = string>(items: readonly T[], searchValue: string, options: Options<T> = {}): T[] {
    function reduceItemsToRanked(matches: Array<RankedItem<T>>, item: T, index: number): Array<RankedItem<T>> {
        const rankingInfo = getHighestRanking(item, keys, searchValue, options);
        const {rank, keyThreshold = threshold} = rankingInfo;

        if (rank >= keyThreshold) {
            matches.push({...rankingInfo, item, index});
        }
        return matches;
    }

    const {keys, threshold = rankings.MATCHES, sort = sortType.DESC, strict = false} = options;
    const matchedItems = items.reduce(reduceItemsToRanked, []);

    let itemsToSort = matchedItems;

    if (options.strict) {
        itemsToSort = matchedItems.filter((item) => item.rank >= threshold + 1);
    }

    return sortRankedItems(itemsToSort, sort);
}

export default filterArrayByMatch;
export {rankings, sortType};

export type {Options, KeyAttributesOptions, KeyOption, RankingInfo, ValueGetterKey};
