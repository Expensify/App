import CONST from '@src/CONST';
import Timing from './actions/Timing';
import {DELIMITER_CHAR_CODE, END_CHAR_CODE, makeTree, stringToNumeric} from './SuffixUkkonenTree';

type SearchableData<T> = {
    /**
     * The data that should be searchable
     */
    data: T[];
    /**
     * A function that generates a string from a data entry. The string's value is used for searching.
     * If you have multiple fields that should be searchable, simply concat them to the string and return it.
     */
    toSearchableString: (data: T) => string;
};

/**
 * Creates a new "FastSearch" instance. "FastSearch" uses a suffix tree to search for (sub-)strings in a list of strings.
 * You can provide multiple datasets. The search results will be returned for each dataset.
 */
function createFastSearch<T>(dataSet: Array<SearchableData<T>>) {
    // Create a numeric list for the suffix tree, and a look up indexes array
    Timing.start(CONST.TIMING.SEARCH_CONVERT_SEARCH_VALUES);
    const listsAsConcatedNumericList: number[] = [];
    const indexesByList: Array<Array<T | undefined>> = [];
    for (const {data, toSearchableString} of dataSet) {
        const [numericRepresentation, searchIndexList] = dataToNumericRepresentation({data, toSearchableString});
        for (const num of numericRepresentation) {
            // Note: we had to use a loop here as push with spread yields a maximum call stack exceeded error
            listsAsConcatedNumericList.push(num);
        }
        indexesByList.push(searchIndexList);
    }
    listsAsConcatedNumericList.push(END_CHAR_CODE);
    Timing.end(CONST.TIMING.SEARCH_CONVERT_SEARCH_VALUES);

    // Create & build the suffix tree:
    Timing.start(CONST.TIMING.SEARCH_MAKE_TREE);
    const tree = makeTree(listsAsConcatedNumericList);
    Timing.end(CONST.TIMING.SEARCH_MAKE_TREE);

    Timing.start(CONST.TIMING.SEARCH_BUILD_TREE);
    tree.build();
    Timing.end(CONST.TIMING.SEARCH_BUILD_TREE);

    /**
     * Searches for the given input and returns results for each dataset.
     */
    function search(searchInput: string): T[][] {
        const searchValueNumeric = stringToNumeric(cleanString(searchInput));
        const result = tree.findSubstring(searchValueNumeric);

        // Map the results to the original options
        const mappedResults = Array.from({length: indexesByList.length}, () => new Set<T>());
        result.forEach((index) => {
            let offset = 0;
            for (let i = 0; i < indexesByList.length; i++) {
                const relativeIndex = index - offset + 1;
                if (relativeIndex < indexesByList[i].length && relativeIndex >= 0) {
                    const option = indexesByList[i][relativeIndex];
                    if (option) {
                        mappedResults[i].add(option);
                    }
                } else {
                    offset += indexesByList[i].length;
                }
            }
        });

        return mappedResults.map((set) => Array.from(set));
    }

    return {
        search,
    };
}

/**
 * The suffix tree can only store string like values, and internally stores those as numbers.
 * This function converts the user data (which are most likely objects) to a numeric representation.
 * Additionally a list of the original data and their index position in the numeric list is created, which is used to map the found occurrences back to the original data.
 */
function dataToNumericRepresentation<T>({data, toSearchableString}: SearchableData<T>): [number[], Array<T | undefined>] {
    const searchIndexList: Array<T | undefined> = [];
    const allDataAsNumbers: number[] = [];

    data.forEach((option, index) => {
        const searchStringForTree = toSearchableString(option);
        // Remove all none a-z chars:
        const cleanedSearchStringForTree = cleanString(searchStringForTree);

        if (cleanedSearchStringForTree.length === 0) {
            return;
        }

        const numericRepresentation = stringToNumeric(cleanedSearchStringForTree);

        // We need to push an array that has the same length as the length of the string we insert for this option:
        const indexes = Array.from({length: numericRepresentation.length}, () => option);
        // Note: we add undefined for the delimiter character
        searchIndexList.push(...indexes, undefined);

        allDataAsNumbers.push(...numericRepresentation);
        if (index < data.length - 1) {
            allDataAsNumbers.push(DELIMITER_CHAR_CODE);
        }
    });

    return [allDataAsNumbers, searchIndexList];
}

// Removes any special characters, except for numbers and letters (including unicode letters)
const nonAlphanumericRegex = /[^0-9\p{L}]/gu;

/**
 * Everything in the tree is treated as lowercase. Strings will additionally be cleaned from
 * special characters, as they are irrelevant for the search, and thus we can save some space.
 */
function cleanString(input: string) {
    return input.toLowerCase().replace(nonAlphanumericRegex, '');
}

const FastSearch = {
    createFastSearch,
};

export default FastSearch;
