/* eslint-disable no-continue */

/**
 * TODO: quick explanation to how suffix ukkonen tree works:
 */

const CHAR_CODE_A = 'a'.charCodeAt(0);
const LETTER_ALPHABET_SIZE = 26;
const ALPHABET_SIZE = LETTER_ALPHABET_SIZE + 3; // +3: special char, delimiter char, end char
const SPECIAL_CHAR_CODE = ALPHABET_SIZE - 3;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;
const END_CHAR_CODE = ALPHABET_SIZE - 1;

// Removes any special characters, except for numbers and letters (including unicode letters)
const nonAlphanumericRegex = /[^0-9\p{L}]/gu;

/**
 * Converts a number to a base26 string number.
 * This is used to fit all kinds of characters in the range of a-z.
 */
function convertToBase26(num: number): string {
    if (num < 0) {
        throw new Error('convertToBase26: Input must be a non-negative integer');
    }

    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    let numCopy = num;

    do {
        numCopy -= 1; // Adjust to 0-based index
        result = alphabet[numCopy % 26] + result;
        numCopy = Math.floor(numCopy / 26);
    } while (numCopy > 0);

    return result;
}

/**
 * Converts a string to an array of numbers representing the characters of the string.
 * Every number in the array is in the range 0-ALPHABET_SIZE (0-28).
 *
 * The numbers are offset by the character code of 'a' (97).
 * - This is so that the numbers from a-z are in the range 0-28.
 * - 26 is for encoding special characters. Character numbers that are not within the range of a-z will be encoded as "specialCharacter + base26(charCode)"
 * - 27 is for the delimiter character
 * - 28 is for the end character
 */
function stringToArray(input: string) {
    const res: number[] = [];
    for (const char of input) {
        const charCode = char.charCodeAt(0);
        const charCodeABased = charCode - CHAR_CODE_A;
        if (charCodeABased >= 0 && charCodeABased < LETTER_ALPHABET_SIZE) {
            res.push(charCodeABased);
        } else {
            const asBase26String = convertToBase26(charCode);
            const asCharCodes = stringToArray(asBase26String);
            res.push(SPECIAL_CHAR_CODE, ...asCharCodes);
        }
    }
    return res;
}

type TreeDataParams<T> = {
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
 * Everything in the tree is treated as lowercase. Strings will additionally be cleaned from
 * special characters, as they are irrelevant for the search, and thus we can save some space.
 */
function cleanString(input: string) {
    return input.toLowerCase().replace(nonAlphanumericRegex, '');
}

/**
 * The suffix tree can only store string like values, and internally stores those as numbers.
 * This function converts the user data (which are most likely objects) to a numeric representation.
 * Additionally a list of the original data and their index position in the numeric list is created, which is used to map the found occurrences back to the original data.
 */
function dataToNumericRepresentation<T>({data, toSearchableString}: TreeDataParams<T>): [number[], Array<T | undefined>] {
    const searchIndexList: Array<T | undefined> = [];
    const allDataAsNumbers: number[] = [];

    data.forEach((option, index) => {
        const searchStringForTree = toSearchableString(option);
        // Remove all none a-z chars:
        const cleanedSearchStringForTree = cleanString(searchStringForTree);

        if (cleanedSearchStringForTree.length === 0) {
            return;
        }

        const numericRepresentation = stringToArray(cleanedSearchStringForTree);

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

/**
 * Makes a tree from an input string
 */
function makeTree<T>(lists: Array<TreeDataParams<T>>) {
    const listsAsConcatedNumericList: number[] = [];

    // We might received multiple lists of data that we want to search in
    // thus indexes is a list of those data lists
    const indexesByList: Array<Array<T | undefined>> = [];

    for (const {data, toSearchableString: transform} of lists) {
        const [numericRepresentation, searchIndexList] = dataToNumericRepresentation({data, toSearchableString: transform});
        for (const num of numericRepresentation) {
            // we have to use a loop here as push with spread yields a maximum call stack exceeded error
            listsAsConcatedNumericList.push(num);
        }
        indexesByList.push(searchIndexList);
    }
    listsAsConcatedNumericList.push(END_CHAR_CODE);

    const transitionNodes: Array<number[] | undefined> = [];
    const leftEdges: number[] = [];
    const rightEdges: Array<number | undefined> = [];
    const defaultREdgeValue = listsAsConcatedNumericList.length - 1;
    const parent: number[] = [];
    const suffixLink: number[] = [];

    let currentNode = 0;
    let currentPosition = 0;
    let nodeCounter = 2;
    let currentIndex = 0;

    function initializeTree() {
        suffixLink[0] = 1;
        leftEdges[0] = -1;
        rightEdges[0] = -1;
        leftEdges[1] = -1;
        rightEdges[1] = -1;
        transitionNodes[1] = Array<number>(ALPHABET_SIZE).fill(0);
    }

    function getOrCreateREdge(node: number): number {
        let rEdge = rightEdges[node];
        if (rEdge === undefined) {
            rEdge = defaultREdgeValue;
            rightEdges[node] = rEdge;
        }
        return rEdge;
    }

    function processCharacter(char: number) {
        while (true) {
            const rEdge = getOrCreateREdge(currentNode);
            if (rEdge < currentPosition) {
                let curNode = transitionNodes[currentNode];

                if (curNode === undefined) {
                    curNode = Array<number>(ALPHABET_SIZE).fill(-1);
                    transitionNodes[currentNode] = curNode;
                }

                if (curNode[char] === -1) {
                    createNewLeaf(char);
                    continue;
                }
                currentNode = curNode[char];
                currentPosition = leftEdges[currentNode];
            }
            if (currentPosition === -1 || char === listsAsConcatedNumericList[currentPosition]) {
                currentPosition++;
            } else {
                splitEdge(char);
                continue;
            }
            break;
        }
        if (char === DELIMITER_CHAR_CODE) {
            resetTreeTraversal();
        }
    }

    function createNewLeaf(c: number) {
        const curNode = transitionNodes[currentNode];
        if (curNode === undefined) {
            throw new Error('createNewLeaf: curNode should not be undefined');
        }

        curNode[c] = nodeCounter;
        leftEdges[nodeCounter] = currentIndex;
        parent[nodeCounter++] = currentNode;
        currentNode = suffixLink[currentNode];

        const rEdge = getOrCreateREdge(currentNode);
        currentPosition = rEdge + 1;
    }

    function splitEdge(c: number) {
        leftEdges[nodeCounter] = leftEdges[currentNode];
        rightEdges[nodeCounter] = currentPosition - 1;
        parent[nodeCounter] = parent[currentNode];
        let transitionTable = transitionNodes[nodeCounter];
        if (transitionTable === undefined) {
            transitionTable = Array<number>(ALPHABET_SIZE).fill(-1);
            transitionNodes[nodeCounter] = transitionTable;
        }
        transitionTable[listsAsConcatedNumericList[currentPosition]] = currentNode;
        transitionTable[c] = nodeCounter + 1;
        leftEdges[nodeCounter + 1] = currentIndex;
        parent[nodeCounter + 1] = nodeCounter;
        leftEdges[currentNode] = currentPosition;
        parent[currentNode] = nodeCounter;

        let parentTransitionNodes = transitionNodes[parent[nodeCounter]];
        if (parentTransitionNodes === undefined) {
            parentTransitionNodes = Array<number>(ALPHABET_SIZE).fill(-1);
            transitionNodes[parent[nodeCounter]] = parentTransitionNodes;
        }
        parentTransitionNodes[listsAsConcatedNumericList[leftEdges[nodeCounter]]] = nodeCounter;
        nodeCounter += 2;
        handleDescent(nodeCounter);
    }

    function handleDescent(ts: number) {
        currentNode = suffixLink[parent[ts - 2]];
        currentPosition = leftEdges[ts - 2];
        while (currentPosition <= (rightEdges[ts - 2] ?? defaultREdgeValue)) {
            const tTv = transitionNodes[currentNode];
            if (tTv === undefined) {
                throw new Error('handleDescent: tTv should not be undefined');
            }
            currentNode = tTv[listsAsConcatedNumericList[currentPosition]];
            const rEdge = getOrCreateREdge(currentNode);
            currentPosition += rEdge - leftEdges[currentNode] + 1;
        }
        if (currentPosition === (rightEdges[ts - 2] ?? defaultREdgeValue) + 1) {
            suffixLink[ts - 2] = currentNode;
        } else {
            suffixLink[ts - 2] = ts;
        }
        const rEdge = getOrCreateREdge(currentNode);
        currentPosition = rEdge - (currentPosition - (rightEdges[ts - 2] ?? defaultREdgeValue)) + 2;
    }

    function resetTreeTraversal() {
        currentNode = 0;
        currentPosition = 0;
    }

    function build() {
        initializeTree();
        for (currentIndex = 0; currentIndex < listsAsConcatedNumericList.length; ++currentIndex) {
            const c = listsAsConcatedNumericList[currentIndex];
            processCharacter(c);
        }
    }

    /**
     * Returns all occurrences of the given (sub)string in the input string.
     *
     * You can think of the tree that we create as a big string that looks like this:
     *
     * "banana{pancake{apple|"
     * The delimiter character '{' is used to separate the different strings.
     * The end character '|' is used to indicate the end of our search string.
     *
     * This function will return the index(es) of found occurrences within this big string.
     * So, when searching for "an", it would return [1, 4, 11].
     */
    function findSubstring(searchString: number[]) {
        const occurrences: number[] = [];

        function dfs(node: number, depth: number) {
            const leftRange = leftEdges[node];
            const rightRange = rightEdges[node] ?? defaultREdgeValue;
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            // console.log('dfs', node, depth, leftRange, rightRange, rangeLen, searchString.length, searchString);

            for (let i = 0; i < rangeLen && depth + i < searchString.length; i++) {
                if (searchString[depth + i] !== listsAsConcatedNumericList[leftRange + i]) {
                    return;
                }
            }

            let isLeaf = true;
            for (let i = 0; i < ALPHABET_SIZE; ++i) {
                const tNode = transitionNodes[node]?.[i];
                const correctChar = depth + rangeLen >= searchString.length || i === searchString[depth + rangeLen];
                if (tNode && tNode !== -1 && correctChar) {
                    isLeaf = false;
                    dfs(tNode, depth + rangeLen);
                }
            }

            if (isLeaf && depth + rangeLen >= searchString.length) {
                occurrences.push(listsAsConcatedNumericList.length - (depth + rangeLen));
            }
        }

        dfs(0, 0);
        return occurrences;
    }

    function findInSearchTree(searchInput: string): T[][] {
        const result = findSubstring(stringToArray(searchInput));

        // Map the results to the original options
        const mappedResults = Array.from({length: lists.length}, () => new Set<T>());
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
        build,
        findSubstring,
        findInSearchTree,
    };
}

export {makeTree, dataToNumericRepresentation as prepareData};
