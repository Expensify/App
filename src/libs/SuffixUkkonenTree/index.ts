/* eslint-disable no-continue */
import {ALPHABET_SIZE, DELIMITER_CHAR_CODE, END_CHAR_CODE, SPECIAL_CHAR_CODE, stringToNumeric} from './utils';

/**
 * This implements a suffix tree using Ukkonen's algorithm.
 * A good visualization to learn about the algorithm can be found here: https://brenden.github.io/ukkonen-animation/
 * Note: This implementation is optimized for performance, not necessarily for readability.
 *
 * You probably don't want to use this directly, but rather use @libs/FastSearch.ts as a easy to use wrapper around this.
 */

/**
 * Creates a new tree instance that can be used to build a suffix tree and search in it.
 * The input is a numeric representation of the search string, which can be create using {@link stringToNumeric}.
 * Separate search values must be separated by the {@link DELIMITER_CHAR_CODE}. The search string must end with the {@link END_CHAR_CODE}.
 *
 * The tree will be built using the Ukkonen's algorithm: https://www.cs.helsinki.fi/u/ukkonen/SuffixT1withFigs.pdf
 */
function makeTree(numericSearchValues: Int8Array) {
    const maxNodes = 2 * numericSearchValues.length;
    // Allocate an ArrayBuffer to store all transitions (flat buffer), 4 bytes per transition (Uint32)
    const transitionNodes = new Int32Array(maxNodes * ALPHABET_SIZE * 4);
    transitionNodes.fill(-1); // Initialize all transitions to -1 (no transition)

    const leftEdges = new Int32Array(maxNodes * 4);
    const rightEdges = new Int32Array(maxNodes * 4);
    const defaultREdgeValue = numericSearchValues.length - 1;

    const parent = new Int32Array(maxNodes * 4);
    const suffixLink = new Int32Array(maxNodes * 4);

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
        // eslint-disable-next-line no-constant-condition
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
    function findSubstring(searchValue: number[]) {
        const occurrences: number[] = [];

        function dfs(node: number, depth: number) {
            const leftRange = leftEdges[node];
            const rightRange = rightEdges[node] ?? defaultREdgeValue;
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            for (let i = 0; i < rangeLen && depth + i < searchValue.length && leftRange + i < numericSearchValues.length; i++) {
                if (searchValue[depth + i] !== numericSearchValues[leftRange + i]) {
                    return;
                }
            }

            let isLeaf = true;
            for (let i = 0; i < ALPHABET_SIZE; ++i) {
                const tNode = transitionNodes[node * ALPHABET_SIZE + i];

                // Search speed optimization: don't go through the edge if it's different than the next char:
                const correctChar = depth + rangeLen >= searchValue.length || i === searchValue[depth + rangeLen];

                if (tNode && tNode !== -1 && correctChar) {
                    isLeaf = false;
                    dfs(tNode, depth + rangeLen);
                }
            }

            if (isLeaf && depth + rangeLen >= searchValue.length) {
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

const SuffixUkkonenTree = {
    makeTree,

    // Re-exported from utils:
    DELIMITER_CHAR_CODE,
    SPECIAL_CHAR_CODE,
    END_CHAR_CODE,
    stringToNumeric,
};

export default SuffixUkkonenTree;
