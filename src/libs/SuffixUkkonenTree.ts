/* eslint-disable no-continue */

/**
 * This implements a suffix tree using Ukkonen's algorithm.
 * A good visualization to learn about the algorithm can be found here: https://brenden.github.io/ukkonen-animation/
 * Note: This implementation is optimized for performance, not necessarily for readability.
 *
 * You probably don't want to use this directly, but rather use @libs/FastSearch.ts as a easy to use wrapper around this.
 */

const CHAR_CODE_A = 'a'.charCodeAt(0);
const LETTER_ALPHABET_SIZE = 26;
const ALPHABET_SIZE = LETTER_ALPHABET_SIZE + 3; // +3: special char, delimiter char, end char
const SPECIAL_CHAR_CODE = ALPHABET_SIZE - 3;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;
const END_CHAR_CODE = ALPHABET_SIZE - 1;

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
 *
 * Note: The string should be converted to lowercase first (otherwise uppercase letters get base26'ed taking more space than necessary).
 */
function stringToNumeric(input: string) {
    const res: number[] = [];
    for (const char of input) {
        const charCode = char.charCodeAt(0);
        const charCodeABased = charCode - CHAR_CODE_A;
        if (charCodeABased >= 0 && charCodeABased < LETTER_ALPHABET_SIZE) {
            res.push(charCodeABased);
        } else {
            const asBase26String = convertToBase26(charCode);
            const asCharCodes = stringToNumeric(asBase26String);
            res.push(SPECIAL_CHAR_CODE, ...asCharCodes);
        }
    }
    return res;
}

/**
 * Creates a new tree instance that can be used to build a suffix tree and search in it.
 * The input is a numeric representation of the search string, which can be create using {@link stringToNumeric}.
 * Separate search values must be separated by the {@link DELIMITER_CHAR_CODE}. The search string must end with the {@link END_CHAR_CODE}.
 *
 * The tree will be built using the Ukkonen's algorithm: https://www.cs.helsinki.fi/u/ukkonen/SuffixT1withFigs.pdf
 */
function makeTree(numericSearchValues: number[]) {
    const transitionNodes: Array<number[] | undefined> = [];
    const leftEdges: number[] = [];
    const rightEdges: Array<number | undefined> = [];
    const defaultREdgeValue = numericSearchValues.length - 1;
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
        // eslint-disable-next-line no-constant-condition
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
            if (currentPosition === -1 || char === numericSearchValues[currentPosition]) {
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
        transitionTable[numericSearchValues[currentPosition]] = currentNode;
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
        parentTransitionNodes[numericSearchValues[leftEdges[nodeCounter]]] = nodeCounter;
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
            currentNode = tTv[numericSearchValues[currentPosition]];
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
        for (currentIndex = 0; currentIndex < numericSearchValues.length; ++currentIndex) {
            const c = numericSearchValues[currentIndex];
            processCharacter(c);
        }
    }

    /**
     * Returns all occurrences of the given (sub)string in the input string.
     *
     * You can think of the tree that we create as a big string that looks like this:
     *
     * "banana$pancake$apple|"
     * The example delimiter character '$' is used to separate the different strings.
     * The end character '|' is used to indicate the end of our search string.
     *
     * This function will return the index(es) of found occurrences within this big string.
     * So, when searching for "an", it would return [1, 3, 8].
     */
    function findSubstring(searchString: number[]) {
        const occurrences: number[] = [];

        function dfs(node: number, depth: number) {
            const leftRange = leftEdges[node];
            const rightRange = rightEdges[node] ?? defaultREdgeValue;
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            for (let i = 0; i < rangeLen && depth + i < searchString.length; i++) {
                if (searchString[depth + i] !== numericSearchValues[leftRange + i]) {
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
                occurrences.push(numericSearchValues.length - (depth + rangeLen));
            }
        }

        dfs(0, 0);
        return occurrences;
    }

    return {
        build,
        findSubstring,
    };
}

export {makeTree, stringToNumeric, DELIMITER_CHAR_CODE, END_CHAR_CODE};
