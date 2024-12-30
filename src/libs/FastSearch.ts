/* eslint-disable rulesdir/prefer-at */
import CONST from '@src/CONST';
import Timing from './actions/Timing';
import DynamicArrayBuffer from './DynamicArrayBuffer';
import SuffixUkkonenTree from './SuffixUkkonenTree';

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

    /**
     * Gives the possibility to identify data by a unique attribute. Assume you have two search results with the same text they might be valid
     * and represent different data. In this case, you can provide a function that returns a unique identifier for the data.
     * If multiple items with the same identifier are found, only the first one will be returned.
     * This fixes: https://github.com/Expensify/App/issues/53579
     */
    uniqueId?: (data: T) => string | undefined;
};

// There are certain characters appear very often in our search data (email addresses), which we don't need to search for.
const charSetToSkip = new Set(['@', '.', '#', '$', '%', '&', '*', '+', '-', '/', ':', ';', '<', '=', '>', '?', '_', '~', '!', ' ', ',', '(', ')']);
// For an account with 12k+ personal details the average search value length was ~60 characters.
const averageSearchValueLength = 60;

/**
 * Creates a new "FastSearch" instance. "FastSearch" uses a suffix tree to search for substrings in a list of strings.
 * You can provide multiple datasets. The search results will be returned for each dataset.
 *
 * Note: Creating a FastSearch instance with a lot of data is computationally expensive. You should create an instance once and reuse it.
 * Searches will be very fast though, even with a lot of data.
 */
function createFastSearch<T>(dataSets: Array<SearchableData<T>>) {
    Timing.start(CONST.TIMING.SEARCH_CONVERT_SEARCH_VALUES);
    const itemsCount = dataSets.reduce((acc, {data}) => acc + data.length, 0);
    // An approximation of how many chars the final search string will have (if it gets bigger the underlying buffer will resize aromatically, but its best to avoid resizes):
    const initialListSize = itemsCount * averageSearchValueLength;
    // The user might provide multiple data sets, but internally, the search values will be stored in this one list:
    const concatenatedNumericList = new DynamicArrayBuffer(initialListSize, Uint8Array);
    // Here we store the index of the data item in the original data list, so we can map the found occurrences back to the original data:
    const occurrenceToIndex = new DynamicArrayBuffer(initialListSize * 4, Uint32Array);
    // We store the last offset for a dataSet, so we can map the found occurrences to the correct dataSet:
    const listOffsets: number[] = [];

    // The tree is 1-indexed, so we need to add a 0 at the beginning:
    concatenatedNumericList.push(0);

    for (const {data, toSearchableString} of dataSets) {
        // Performance critical: the array parameters are passed by reference, so we don't have to create new arrays every time:
        dataToNumericRepresentation(concatenatedNumericList, occurrenceToIndex, {data, toSearchableString});
        listOffsets.push(concatenatedNumericList.length);
    }
    concatenatedNumericList.push(SuffixUkkonenTree.END_CHAR_CODE);
    listOffsets[listOffsets.length - 1] = concatenatedNumericList.length;
    Timing.end(CONST.TIMING.SEARCH_CONVERT_SEARCH_VALUES);

    // The list might be larger than necessary, so we clamp it to the actual size:
    concatenatedNumericList.truncate();

    // Create & build the suffix tree:
    Timing.start(CONST.TIMING.SEARCH_MAKE_TREE);
    const tree = SuffixUkkonenTree.makeTree(concatenatedNumericList);
    Timing.end(CONST.TIMING.SEARCH_MAKE_TREE);

    Timing.start(CONST.TIMING.SEARCH_BUILD_TREE);
    tree.build();
    Timing.end(CONST.TIMING.SEARCH_BUILD_TREE);

    /**
     * Searches for the given input and returns results for each dataset.
     */
    function search(searchInput: string): T[][] {
        const cleanedSearchString = cleanString(searchInput);
        const {numeric} = SuffixUkkonenTree.stringToNumeric(cleanedSearchString, {
            charSetToSkip,
            // stringToNumeric might return a list that is larger than necessary, so we clamp it to the actual size
            // (otherwise the search could fail as we include in our search empty array values):
            clamp: true,
        });
        // TODO: we shouldn't need to convert to an array here (although it should be fast)
        const result = tree.findSubstring(Array.from(numeric));

        const resultsByDataSet = Array.from({length: dataSets.length}, () => new Set<T>());
        const uniqueMap: Record<number, Record<string, T>> = {};
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < result.length; i++) {
            const occurrenceIndex = result[i];
            const itemIndexInDataSet = occurrenceToIndex.array[occurrenceIndex];
            const dataSetIndex = listOffsets.findIndex((listOffset) => occurrenceIndex < listOffset);

            if (dataSetIndex === -1) {
                throw new Error(`[FastSearch] The occurrence index ${occurrenceIndex} is not in any dataset`);
            }
            const item = dataSets[dataSetIndex].data[itemIndexInDataSet];
            if (!item) {
                throw new Error(`[FastSearch] The item with index ${itemIndexInDataSet} in dataset ${dataSetIndex} is not defined`);
            }

            // Check for uniqueness eventually
            const getUniqueId = dataSets[dataSetIndex].uniqueId;
            if (getUniqueId) {
                const uniqueId = getUniqueId(item);
                if (uniqueId) {
                    const hasId = uniqueMap[dataSetIndex]?.[uniqueId];
                    if (hasId) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    if (!uniqueMap[dataSetIndex]) {
                        uniqueMap[dataSetIndex] = {};
                    }
                    uniqueMap[dataSetIndex][uniqueId] = item;
                }
            }

            resultsByDataSet[dataSetIndex].add(item);
        }

        return resultsByDataSet.map((set) => Array.from(set));
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
function dataToNumericRepresentation<T>(
    concatenatedNumericList: DynamicArrayBuffer<Uint8Array>,
    occurrenceToIndex: DynamicArrayBuffer<Uint32Array>,
    {data, toSearchableString}: SearchableData<T>,
): void {
    data.forEach((option, index) => {
        // console.log('Processing index', index);
        const searchStringForTree = toSearchableString(option);
        const cleanedSearchStringForTree = cleanString(searchStringForTree);

        if (cleanedSearchStringForTree.length === 0) {
            return;
        }

        SuffixUkkonenTree.stringToNumeric(cleanedSearchStringForTree, {
            charSetToSkip,
            out: {
                index,
                occurrenceToIndex,
                array: concatenatedNumericList,
            },
        });
        occurrenceToIndex.set(concatenatedNumericList.length, index);
        concatenatedNumericList.push(SuffixUkkonenTree.DELIMITER_CHAR_CODE);
    });
}

/**
 * Everything in the tree is treated as lowercase.
 */
function cleanString(input: string) {
    return input.toLowerCase();
}

const FastSearch = {
    createFastSearch,
};

export default FastSearch;
