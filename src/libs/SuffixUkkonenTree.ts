/* eslint-disable no-continue */

/**
 * This implements a suffix tree using Ukkonen's algorithm.
 * A good visualization to learn about the algorithm can be found here: https://brenden.github.io/ukkonen-animation/
 * Note: This implementation is optimized for performance, not necessarily for readability.
 *
 * You probably don't want to use this directly, but rather use @libs/FastSearch.ts as a easy to use wrapper around this.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const LETTER_ALPHABET_SIZE = ALPHABET.length;
const ALPHABET_SIZE = LETTER_ALPHABET_SIZE + 3; // +3: special char, delimiter char, end char
const SPECIAL_CHAR_CODE = ALPHABET_SIZE - 3;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;
const END_CHAR_CODE = ALPHABET_SIZE - 1;

function convertToBase26(num: number): string {
    if (num < 0) {
        throw new Error('convertToBase26: Input must be a non-negative integer');
    }

    let result = '';

    do {
        // eslint-disable-next-line no-param-reassign
        num--;
        result = ALPHABET[num % 26] + result;
        // eslint-disable-next-line no-bitwise, no-param-reassign
        num >>= 5; // Equivalent to Math.floor(num / 26), but faster
    } while (num > 0);

    return result;
}

// Pre-compute base26 lookup table
const base26LookupTable = new Array<string>(65536);
for (let i = 0; i < 65536; i++) {
    base26LookupTable[i] = convertToBase26(i);
}

const letterMap = Array.from(ALPHABET).reduce((acc, char, index) => {
    acc[char] = index;
    return acc;
}, {} as Record<string, number>);

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
function stringToNumeric(input: string): number[] {
    const maxSize = input.length * 2; // Estimate maximum size
    const res = new Array<number>(maxSize);
    let index = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char >= 'a' && char <= 'z') {
            res[index++] = letterMap[char];
        } else {
            const charCode = input.charCodeAt(i);
            const asBase26String = base26LookupTable[charCode];
            res[index++] = SPECIAL_CHAR_CODE;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < asBase26String.length; j++) {
                res[index++] = letterMap[asBase26String[j]];
            }
        }
    }

    return res.slice(0, index); // Trim to actual size
}

/**
 * Creates a new tree instance that can be used to build a suffix tree and search in it.
 * The input is a numeric representation of the search string, which can be create using {@link stringToNumeric}.
 * Separate search values must be separated by the {@link DELIMITER_CHAR_CODE}. The search string must end with the {@link END_CHAR_CODE}.
 *
 * The tree will be built using the Ukkonen's algorithm: https://www.cs.helsinki.fi/u/ukkonen/SuffixT1withFigs.pdf
 */
function makeTree(numericSearchValues: number[]) {
    const maxNodes = 2 * numericSearchValues.length;
    // Allocate an ArrayBuffer to store all transitions (flat buffer)
    const buffer = new ArrayBuffer(maxNodes * ALPHABET_SIZE * 4); // 4 bytes per transition (Uint32)
    const transitionNodes = new Int32Array(buffer);
    transitionNodes.fill(-1); // Initialize all transitions to -1 (no transition)

    const bufferLeftEdges = new ArrayBuffer(maxNodes * 4); // 4 bytes per left edge (Uint32)
    const leftEdges = new Int32Array(bufferLeftEdges);

    // const rightEdges: Array<number | undefined> = [];
    const bufferRightEdges = new ArrayBuffer(maxNodes * 4); // 4 bytes per right edge (Uint32)
    const rightEdges = new Int32Array(bufferRightEdges);
    const defaultREdgeValue = numericSearchValues.length - 1;

    // const parent: number[] = [];
    const bufferParent = new ArrayBuffer(maxNodes * 4); // 4 bytes per parent (Uint32)
    const parent = new Int32Array(bufferParent);

    // const suffixLink: number[] = [];
    const bufferSuffixLink = new ArrayBuffer(maxNodes * 4); // 4 bytes per suffix link (Uint32)
    const suffixLink = new Int32Array(bufferSuffixLink);

    let currentNode = 0;
    let currentPosition = 0;
    let nodeCounter = 2;
    let currentIndex = 0;

    function initializeTree() {
        rightEdges.fill(numericSearchValues.length - 1);
        suffixLink[0] = 1;
        leftEdges[0] = -1;
        rightEdges[0] = -1;
        leftEdges[1] = -1;
        rightEdges[1] = -1;
        for (let i = 0; i < ALPHABET_SIZE; ++i) {
            transitionNodes[ALPHABET_SIZE + i] = 0;
        }
    }

    function processCharacter(char: number) {
        while (true) {
            if (rightEdges[currentNode] < currentPosition) {
                if (transitionNodes[currentNode * ALPHABET_SIZE + char] === -1) {
                    createNewLeaf(char);
                    continue;
                }
                currentNode = transitionNodes[currentNode * ALPHABET_SIZE + char];
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
    }

    function createNewLeaf(c: number) {
        transitionNodes[currentNode * ALPHABET_SIZE + c] = nodeCounter;
        leftEdges[nodeCounter] = currentIndex;
        parent[nodeCounter++] = currentNode;
        currentNode = suffixLink[currentNode];

        currentPosition = rightEdges[currentNode] + 1;
    }

    function splitEdge(c: number) {
        leftEdges[nodeCounter] = leftEdges[currentNode];
        rightEdges[nodeCounter] = currentPosition - 1;
        parent[nodeCounter] = parent[currentNode];

        transitionNodes[nodeCounter * ALPHABET_SIZE + numericSearchValues[currentPosition]] = currentNode;
        transitionNodes[nodeCounter * ALPHABET_SIZE + c] = nodeCounter + 1;
        leftEdges[nodeCounter + 1] = currentIndex;
        parent[nodeCounter + 1] = nodeCounter;
        leftEdges[currentNode] = currentPosition;
        parent[currentNode] = nodeCounter;

        transitionNodes[parent[nodeCounter] * ALPHABET_SIZE + numericSearchValues[leftEdges[nodeCounter]]] = nodeCounter;
        nodeCounter += 2;
        handleDescent(nodeCounter);
    }

    function handleDescent(ts: number) {
        currentNode = suffixLink[parent[ts - 2]];
        currentPosition = leftEdges[ts - 2];
        while (currentPosition <= (rightEdges[ts - 2] ?? defaultREdgeValue)) {
            currentNode = transitionNodes[currentNode * ALPHABET_SIZE + numericSearchValues[currentPosition]];
            currentPosition += rightEdges[currentNode] - leftEdges[currentNode] + 1;
        }
        if (currentPosition === (rightEdges[ts - 2] ?? defaultREdgeValue) + 1) {
            suffixLink[ts - 2] = currentNode;
        } else {
            suffixLink[ts - 2] = ts;
        }
        currentPosition = rightEdges[currentNode] - (currentPosition - (rightEdges[ts - 2] ?? defaultREdgeValue)) + 2;
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

            for (let i = 0; i < rangeLen && depth + i < searchString.length && leftRange + i < numericSearchValues.length; i++) {
                if (searchString[depth + i] !== numericSearchValues[leftRange + i]) {
                    return;
                }
            }

            let isLeaf = true;
            for (let i = 0; i < ALPHABET_SIZE; ++i) {
                const tNode = transitionNodes[node * ALPHABET_SIZE + i];

                // Search speed optimization: don't go through the edge if it's different than the next char:
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
