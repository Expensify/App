"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable rulesdir/prefer-at */
var CONST_1 = require("@src/CONST");
var Timing_1 = require("./actions/Timing");
var DynamicArrayBuffer_1 = require("./DynamicArrayBuffer");
var SuffixUkkonenTree_1 = require("./SuffixUkkonenTree");
// There are certain characters appear very often in our search data (email addresses), which we don't need to search for.
var charSetToSkip = new Set(['@', '.', '#', '$', '%', '&', '*', '+', '-', '/', ':', ';', '<', '=', '>', '?', '_', '~', '!', ' ', ',', '(', ')']);
// For an account with 12k+ personal details the average search value length was ~60 characters.
var averageSearchValueLength = 60;
/**
 * Creates a new "FastSearch" instance. "FastSearch" uses a suffix tree to search for substrings in a list of strings.
 * You can provide multiple datasets. The search results will be returned for each dataset.
 *
 * Note: Creating a FastSearch instance with a lot of data is computationally expensive. You should create an instance once and reuse it.
 * Searches will be very fast though, even with a lot of data.
 */
function createFastSearch(dataSets, options) {
    Timing_1.default.start(CONST_1.default.TIMING.SEARCH_CONVERT_SEARCH_VALUES);
    var itemsCount = dataSets.reduce(function (acc, _a) {
        var data = _a.data;
        return acc + data.length;
    }, 0);
    // An approximation of how many chars the final search string will have (if it gets bigger the underlying buffer will resize aromatically, but its best to avoid resizes):
    var initialListSize = itemsCount * averageSearchValueLength;
    // The user might provide multiple data sets, but internally, the search values will be stored in this one list:
    var concatenatedNumericList = new DynamicArrayBuffer_1.default(initialListSize, Uint8Array);
    // Here we store the index of the data item in the original data list, so we can map the found occurrences back to the original data:
    var occurrenceToIndex = new DynamicArrayBuffer_1.default(initialListSize, Uint32Array);
    // We store the last offset for a dataSet, so we can map the found occurrences to the correct dataSet:
    var listOffsets = [];
    // The tree is 1-indexed, so we need to add a 0 at the beginning:
    concatenatedNumericList.push(0);
    var searchableStringsMap = new Map();
    for (var _i = 0, dataSets_1 = dataSets; _i < dataSets_1.length; _i++) {
        var dataSet = dataSets_1[_i];
        // Performance critical: the array parameters are passed by reference, so we don't have to create new arrays every time:
        dataToNumericRepresentation(dataSet, concatenatedNumericList, occurrenceToIndex, searchableStringsMap, options);
        listOffsets.push(concatenatedNumericList.length);
    }
    concatenatedNumericList.push(SuffixUkkonenTree_1.default.END_CHAR_CODE);
    listOffsets[listOffsets.length - 1] = concatenatedNumericList.length;
    Timing_1.default.end(CONST_1.default.TIMING.SEARCH_CONVERT_SEARCH_VALUES);
    // The list might be larger than necessary, so we clamp it to the actual size:
    concatenatedNumericList.truncate();
    // Create & build the suffix tree:
    Timing_1.default.start(CONST_1.default.TIMING.SEARCH_MAKE_TREE);
    var tree = SuffixUkkonenTree_1.default.makeTree(concatenatedNumericList);
    Timing_1.default.end(CONST_1.default.TIMING.SEARCH_MAKE_TREE);
    Timing_1.default.start(CONST_1.default.TIMING.SEARCH_BUILD_TREE);
    tree.build();
    Timing_1.default.end(CONST_1.default.TIMING.SEARCH_BUILD_TREE);
    /**
     * Searches for the given input and returns results for each dataset.
     */
    function search(searchInput) {
        var _a;
        var cleanedSearchString = cleanString(searchInput);
        var numeric = SuffixUkkonenTree_1.default.stringToNumeric(cleanedSearchString, {
            charSetToSkip: charSetToSkip,
            // stringToNumeric might return a list that is larger than necessary, so we clamp it to the actual size
            // (otherwise the search could fail as we include in our search empty array values):
            clamp: true,
        }).numeric;
        var result = tree.findSubstring(Array.from(numeric));
        var resultsByDataSet = Array.from({ length: dataSets.length }, function () { return new Set(); });
        var uniqueMap = {};
        var _loop_1 = function (i) {
            var occurrenceIndex = result[i];
            var itemIndexInDataSet = occurrenceToIndex.array[occurrenceIndex];
            var dataSetIndex = listOffsets.findIndex(function (listOffset) { return occurrenceIndex < listOffset; });
            if (dataSetIndex === -1) {
                throw new Error("[FastSearch] The occurrence index ".concat(occurrenceIndex, " is not in any dataset"));
            }
            var item = dataSets[dataSetIndex].data[itemIndexInDataSet];
            if (!item) {
                throw new Error("[FastSearch] The item with index ".concat(itemIndexInDataSet, " in dataset ").concat(dataSetIndex, " is not defined"));
            }
            // Check for uniqueness eventually
            var getUniqueId = dataSets[dataSetIndex].uniqueId;
            if (getUniqueId) {
                var uniqueId = getUniqueId(item);
                if (uniqueId) {
                    var hasId = (_a = uniqueMap[dataSetIndex]) === null || _a === void 0 ? void 0 : _a[uniqueId];
                    if (hasId) {
                        return "continue";
                    }
                    if (!uniqueMap[dataSetIndex]) {
                        uniqueMap[dataSetIndex] = {};
                    }
                    uniqueMap[dataSetIndex][uniqueId] = item;
                }
            }
            resultsByDataSet[dataSetIndex].add(item);
        };
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (var i = 0; i < result.length; i++) {
            _loop_1(i);
        }
        return resultsByDataSet.map(function (set) { return Array.from(set); });
    }
    function dispose() {
        concatenatedNumericList.clear();
        occurrenceToIndex.clear();
        tree.disposeTree();
        listOffsets.length = 0;
    }
    return {
        search: search,
        dispose: dispose,
        searchableStringsMap: searchableStringsMap,
    };
}
/**
 * The suffix tree can only store string like values, and internally stores those as numbers.
 * This function converts the user data (which are most likely objects) to a numeric representation.
 * Additionally a list of the original data and their index position in the numeric list is created, which is used to map the found occurrences back to the original data.
 */
function dataToNumericRepresentation(_a, concatenatedNumericList, occurrenceToIndex, searchableStringsMap, options) {
    var data = _a.data, toSearchableString = _a.toSearchableString, uniqueId = _a.uniqueId;
    data.forEach(function (option, index) {
        var searchStringForTree = toSearchableString(option);
        if (options === null || options === void 0 ? void 0 : options.shouldStoreSearchableStrings) {
            var id = uniqueId === null || uniqueId === void 0 ? void 0 : uniqueId(option);
            if (id) {
                searchableStringsMap.set(id, searchStringForTree);
            }
        }
        var cleanedSearchStringForTree = cleanString(searchStringForTree);
        if (cleanedSearchStringForTree.length === 0) {
            return;
        }
        SuffixUkkonenTree_1.default.stringToNumeric(cleanedSearchStringForTree, {
            charSetToSkip: charSetToSkip,
            out: {
                index: index,
                occurrenceToIndex: occurrenceToIndex,
                array: concatenatedNumericList,
            },
        });
        occurrenceToIndex.set(concatenatedNumericList.length, index);
        concatenatedNumericList.push(SuffixUkkonenTree_1.default.DELIMITER_CHAR_CODE);
    });
}
/**
 * Everything in the tree is treated as lowercase.
 */
function cleanString(input) {
    return input.toLowerCase();
}
var FastSearch = {
    createFastSearch: createFastSearch,
};
exports.default = FastSearch;
