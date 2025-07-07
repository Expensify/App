"use strict";
/* eslint-disable rulesdir/prefer-at */
// .at() has a performance overhead we explicitly want to avoid here
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
/**
 * This implements a suffix tree using Ukkonen's algorithm.
 * A good visualization to learn about the algorithm can be found here: https://brenden.github.io/ukkonen-animation/
 * A good video explaining Ukkonen's algorithm can be found here: https://www.youtube.com/watch?v=ALEV0Hc5dDk
 * Note: This implementation is optimized for performance, not necessarily for readability.
 *
 * You probably don't want to use this directly, but rather use @libs/FastSearch.ts as a easy to use wrapper around this.
 */
/**
 * Creates a new tree instance that can be used to build a suffix tree and search in it.
 * The input is a numeric representation of the search string, which can be created using {@link stringToNumeric}.
 * Separate search values must be separated by the {@link DELIMITER_CHAR_CODE}. The search string must end with the {@link END_CHAR_CODE}.
 *
 * The tree will be built using the Ukkonen's algorithm: https://www.cs.helsinki.fi/u/ukkonen/SuffixT1withFigs.pdf
 */
function makeTree(numericSearchValues) {
    // Every leaf represents a suffix. There can't be more than n suffixes.
    // Every internal node has to have at least 2 children. So the total size of ukkonen tree is not bigger than 2n - 1.
    // + 1 is because an extra character at the beginning to offset the 1-based indexing.
    var maxNodes = 2 * numericSearchValues.length + 1;
    /*
       This array represents all internal nodes in the suffix tree.
       When building this tree, we'll be given a character in the string, and we need to be able to lookup in constant time
       if there's any edge connected to a node starting with that character. For example, given a tree like this:

               root
              / | \
             a  b  c
 
       and the next character in our string is 'd', we need to be able do check if any of the edges from the root node
       start with the letter 'd', without looping through all the edges.

       To accomplish this, each node gets an array matching the alphabet size.
       So you can imagine if our alphabet was just [a,b,c,d], then each node would get an array like [0,0,0,0].
       If we add an edge starting with 'a', then the root node would be [1,0,0,0]
       So given an arbitrary letter such as 'd', then we can take the position of that letter in its alphabet (position 3 in our example)
       and check whether that index in the array is 0 or 1. If it's a 1, then there's an edge starting with the letter 'd'.

       Note that for efficiency, all nodes are stored in a single flat array. That's how we end up with (maxNodes * alphabet_size).
       In the example of a 4-character alphabet, we'd have an array like this:

          root       root.left     root.right              last possible node
        /     \       /     \       /     \                      /     \
       [0,0,0,0,      0,0,0,0,      0,0,0,0,  .................  0,0,0,0]
     */
    var transitionNodes = new Uint32Array(maxNodes * utils_1.ALPHABET_SIZE);
    // Storing the range of the original string that each node represents:
    var rangeStart = new Uint32Array(maxNodes);
    var rangeEnd = new Uint32Array(maxNodes);
    var parent = new Uint32Array(maxNodes);
    var suffixLink = new Uint32Array(maxNodes);
    var currentNode = 1;
    var currentPosition = 1;
    var nodeCounter = 3;
    var currentIndex = 1;
    function initializeTree() {
        rangeEnd.fill(numericSearchValues.length);
        rangeEnd[1] = 0;
        rangeEnd[2] = 0;
        suffixLink[1] = 2;
        for (var i = 0; i < utils_1.ALPHABET_SIZE; ++i) {
            transitionNodes[utils_1.ALPHABET_SIZE * 2 + i] = 1;
        }
    }
    function processCharacter(char) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (rangeEnd[currentNode] < currentPosition) {
                if (transitionNodes[currentNode * utils_1.ALPHABET_SIZE + char] === 0) {
                    createNewLeaf(char);
                    continue;
                }
                currentNode = transitionNodes[currentNode * utils_1.ALPHABET_SIZE + char];
                currentPosition = rangeStart[currentNode];
            }
            if (currentPosition === 0 || char === numericSearchValues.array[currentPosition]) {
                currentPosition++;
            }
            else {
                splitEdge(char);
                continue;
            }
            break;
        }
    }
    function createNewLeaf(c) {
        transitionNodes[currentNode * utils_1.ALPHABET_SIZE + c] = nodeCounter;
        rangeStart[nodeCounter] = currentIndex;
        parent[nodeCounter++] = currentNode;
        currentNode = suffixLink[currentNode];
        currentPosition = rangeEnd[currentNode] + 1;
    }
    function splitEdge(c) {
        rangeStart[nodeCounter] = rangeStart[currentNode];
        rangeEnd[nodeCounter] = currentPosition - 1;
        parent[nodeCounter] = parent[currentNode];
        transitionNodes[nodeCounter * utils_1.ALPHABET_SIZE + numericSearchValues.array[currentPosition]] = currentNode;
        transitionNodes[nodeCounter * utils_1.ALPHABET_SIZE + c] = nodeCounter + 1;
        rangeStart[nodeCounter + 1] = currentIndex;
        parent[nodeCounter + 1] = nodeCounter;
        rangeStart[currentNode] = currentPosition;
        parent[currentNode] = nodeCounter;
        transitionNodes[parent[nodeCounter] * utils_1.ALPHABET_SIZE + numericSearchValues.array[rangeStart[nodeCounter]]] = nodeCounter;
        nodeCounter += 2;
        handleDescent(nodeCounter);
    }
    function handleDescent(latestNodeIndex) {
        currentNode = suffixLink[parent[latestNodeIndex - 2]];
        currentPosition = rangeStart[latestNodeIndex - 2];
        while (currentPosition <= rangeEnd[latestNodeIndex - 2]) {
            currentNode = transitionNodes[currentNode * utils_1.ALPHABET_SIZE + numericSearchValues.array[currentPosition]];
            currentPosition += rangeEnd[currentNode] - rangeStart[currentNode] + 1;
        }
        if (currentPosition === rangeEnd[latestNodeIndex - 2] + 1) {
            suffixLink[latestNodeIndex - 2] = currentNode;
        }
        else {
            suffixLink[latestNodeIndex - 2] = latestNodeIndex;
        }
        currentPosition = rangeEnd[currentNode] - (currentPosition - rangeEnd[latestNodeIndex - 2]) + 2;
    }
    function build() {
        initializeTree();
        for (currentIndex = 1; currentIndex < numericSearchValues.length; ++currentIndex) {
            var c = numericSearchValues.array[currentIndex];
            processCharacter(c);
        }
    }
    function disposeTree() {
        rangeEnd = new Uint32Array(0);
        rangeStart = new Uint32Array(0);
        transitionNodes = new Uint32Array(0);
        parent = new Uint32Array(0);
        suffixLink = new Uint32Array(0);
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
    function findSubstring(searchValue) {
        var occurrences = [];
        function dfs(node, depth) {
            var leftRange = rangeStart[node];
            var rightRange = rangeEnd[node];
            var rangeLen = node === 1 ? 0 : rightRange - leftRange + 1;
            for (var i = 0; i < rangeLen && depth + i < searchValue.length && leftRange + i < numericSearchValues.length; i++) {
                if (searchValue[depth + i] !== numericSearchValues.array[leftRange + i]) {
                    return;
                }
            }
            var isLeaf = true;
            for (var i = 0; i < utils_1.ALPHABET_SIZE; ++i) {
                var tNode = transitionNodes[node * utils_1.ALPHABET_SIZE + i];
                // Search speed optimization: don't go through the edge if it's different than the next char:
                var correctChar = depth + rangeLen >= searchValue.length || i === searchValue[depth + rangeLen];
                if (tNode !== 0 && tNode !== 1 && correctChar) {
                    isLeaf = false;
                    dfs(tNode, depth + rangeLen);
                }
            }
            if (isLeaf && depth + rangeLen >= searchValue.length) {
                occurrences.push(numericSearchValues.length - (depth + rangeLen) + 1);
            }
        }
        dfs(1, 0);
        return occurrences;
    }
    return {
        build: build,
        findSubstring: findSubstring,
        disposeTree: disposeTree,
    };
}
var SuffixUkkonenTree = {
    makeTree: makeTree,
    // Re-exported from utils:
    DELIMITER_CHAR_CODE: utils_1.DELIMITER_CHAR_CODE,
    SPECIAL_CHAR_CODE: utils_1.SPECIAL_CHAR_CODE,
    END_CHAR_CODE: utils_1.END_CHAR_CODE,
    stringToNumeric: utils_1.stringToNumeric,
};
exports.default = SuffixUkkonenTree;
