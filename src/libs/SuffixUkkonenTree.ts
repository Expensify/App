import enEmojis from '@assets/emojis/en';

const CHAR_CODE_A = 'a'.charCodeAt(0);
const ALPHABET_SIZE = 28;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;

// TODO:
// make makeTree faster
// how to deal with unicode characters such as spanish ones?

/**
 * Converts a string to an array of numbers representing the characters of the string.
 * The numbers are offset by the character code of 'a' (97). 
 * - This is so that the numbers from a-z are in the range 0-25.
 * - 26 is for the delimiter character "{",
 * - 27 is for the end character "|".
 */
function stringToArray(input: string) {
    const res: number[] = [];
    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i) - CHAR_CODE_A;
        if (charCode >= 0 && charCode < ALPHABET_SIZE) {
            res.push(charCode);
        }
    }
    return res;
}

/**
 * Makes a tree from an input string, which has been converted by {@link stringToArray}.
 * **Important:** As we only support an alphabet of 26 characters, the input string should only contain characters from a-z.
 * Thus, all input data must be cleaned before being passed to this function.
 * If you then use this tree for search you should clean your search input as well (so that a search query of "testuser@myEmail.com" becomes "testusermyemailcom").
 */
function makeTree(a: number[]) {
    const N = 1000000;
    const start = performance.now();
    const t = Array.from({length: N}, () => Array(ALPHABET_SIZE).fill(-1)) as number[][];
    const l = Array(N).fill(0) as number[];
    const r = Array(N).fill(0) as number[];
    const p = Array(N).fill(0) as number[];
    const s = Array(N).fill(0) as number[];
    const end = performance.now();
    console.log('Allocating memory took:', end - start, 'ms');

    let tv = 0;
    let tp = 0;
    let ts = 2;
    let la = 0;

    function initializeTree() {
        r.fill(a.length - 1);
        s[0] = 1;
        l[0] = -1;
        r[0] = -1;
        l[1] = -1;
        r[1] = -1;
        t[1].fill(0);
    }

    function processCharacter(c: number) {
        while (true) {
            if (r[tv] < tp) {
                if (t[tv][c] === -1) {
                    createNewLeaf(c);
                    continue;
                }
                tv = t[tv][c];
                tp = l[tv];
            }
            if (tp === -1 || c === a[tp]) {
                tp++;
            } else {
                splitEdge(c);
                continue;
            }
            break;
        }
        if (c === DELIMITER_CHAR_CODE) {
            resetTreeTraversal();
        }
    }

    function createNewLeaf(c: number) {
        t[tv][c] = ts;
        l[ts] = la;
        p[ts++] = tv;
        tv = s[tv];
        tp = r[tv] + 1;
    }

    function splitEdge(c: number) {
        l[ts] = l[tv];
        r[ts] = tp - 1;
        p[ts] = p[tv];
        t[ts][a[tp]] = tv;
        t[ts][c] = ts + 1;
        l[ts + 1] = la;
        p[ts + 1] = ts;
        l[tv] = tp;
        p[tv] = ts;
        t[p[ts]][a[l[ts]]] = ts;
        ts += 2;
        handleDescent(ts);
    }

    function handleDescent(ts: number) {
        tv = s[p[ts - 2]];
        tp = l[ts - 2];
        while (tp <= r[ts - 2]) {
            tv = t[tv][a[tp]];
            tp += r[tv] - l[tv] + 1;
        }
        if (tp === r[ts - 2] + 1) {
            s[ts - 2] = tv;
        } else {
            s[ts - 2] = ts;
        }
        tp = r[tv] - (tp - r[ts - 2]) + 2;
    }

    function resetTreeTraversal() {
        tv = 0;
        tp = 0;
    }

    function build() {
        initializeTree();
        for (la = 0; la < a.length; ++la) {
            const c = a[la];
            processCharacter(c);
        }
    }

    /**
     * Returns all occurrences of the given (sub)string in the input string.
     */
    function findSubstring(searchString: string) {
        const occurrences: number[] = [];

        function dfs(node: number, depth: number) {
            const leftRange = l[node];
            const rightRange = r[node];
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            for (let i = 0; i < rangeLen && depth + i < searchString.length; i++) {
                if (searchString.charCodeAt(depth + i) - CHAR_CODE_A !== a[leftRange + i]) {
                    return;
                }
            }

            let isLeaf = true;
            for (let i = 0; i < ALPHABET_SIZE; ++i) {
                if (t[node][i] !== -1) {
                    isLeaf = false;
                    dfs(t[node][i], depth + rangeLen);
                }
            }

            if (isLeaf && depth >= searchString.length) {
                occurrences.push(a.length - (depth + rangeLen));
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

function performanceProfile(input: string, search = 'sasha') {
    // TODO: For emojis we could precalculate the stringToArray or even the makeTree function during build time using a babel plugin
    const {build, findSubstring} = makeTree(stringToArray(input));

    const buildStart = performance.now();
    build();
    const buildEnd = performance.now();
    console.log('Building time:', buildEnd - buildStart, 'ms');

    const searchStart = performance.now();
    const results = findSubstring(search);
    const searchEnd = performance.now();
    console.log('Search time:', searchEnd - searchStart, 'ms');
    console.log(results);

    return {
        buildTime: buildEnd - buildStart,
        recursiveSearchTime: searchEnd - searchStart,
    };
}

// Demo function testing the performance for emojis
function testEmojis() {
    let searchString = '';
    Object.values(enEmojis).forEach(({keywords}) => {
        searchString += `${keywords.join('')}{`;
    });
    return performanceProfile(searchString, 'smile');
}

export {makeTree, stringToArray, runTest, testEmojis};
