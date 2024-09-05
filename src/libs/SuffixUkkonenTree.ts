import enEmojis from '@assets/emojis/en';
import {DATA} from './test';

const CHAR_CODE_A = 'a'.charCodeAt(0);
const ALPHABET_SIZE = 28;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;

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

function makeTree(a: number[]) {
    const N = 1000000;
    const t = Array.from({length: N}, () => Array(ALPHABET_SIZE).fill(-1)) as number[][];
    const l = Array(N).fill(0) as number[];
    const r = Array(N).fill(0) as number[];
    const p = Array(N).fill(0) as number[];
    const s = Array(N).fill(0) as number[];

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

    function findSubstring(sString: string) {
        const s = stringToArray(sString);
        const occurrences: number[] = [];
        const st: Array<[number, number]> = [[0, 0]];

        while (st.length > 0) {
            const [node, depth] = st.pop()!;

            let isLeaf = true;
            const leftRange = l[node];
            const rightRange = r[node];
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            let matches = true;
            for (let i = 0; i < rangeLen && depth + i < s.length; i++) {
                if (s[depth + i] !== a[leftRange + i]) {
                    matches = false;
                    break;
                }
            }

            if (!matches) {
                continue;
            }

            for (let i = ALPHABET_SIZE - 1; i >= 0; --i) {
                if (t[node][i] !== -1) {
                    isLeaf = false;
                    st.push([t[node][i], depth + rangeLen]);
                }
            }

            if (isLeaf && depth + rangeLen >= s.length) {
                occurrences.push(a.length - (depth + rangeLen));
            }
        }

        return occurrences;
    }

    function findSubstringRecursive(s: string) {
        const occurrences: number[] = [];

        function dfs(node: number, depth: number) {
            const leftRange = l[node];
            const rightRange = r[node];
            const rangeLen = node === 0 ? 0 : rightRange - leftRange + 1;

            for (let i = 0; i < rangeLen && depth + i < s.length; i++) {
                if (s.charCodeAt(depth + i) - CHAR_CODE_A !== a[leftRange + i]) {
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

            if (isLeaf && depth >= s.length) {
                occurrences.push(a.length - (depth + rangeLen));
            }
        }

        dfs(0, 0);
        return occurrences;
    }

    return {
        build,
        findSubstring,
        findSubstringRecursive,
    };
}

function performanceProfile(input: string, search = 'sasha') {
    const {build, findSubstring, findSubstringRecursive} = makeTree(stringToArray(input));

    const buildStart = performance.now();
    build();
    const buildEnd = performance.now();
    console.log('Building time:', buildEnd - buildStart, 'ms');

    const searchStart = performance.now();
    const results = findSubstring(search);
    const searchEnd = performance.now();
    console.log('Search time:', searchEnd - searchStart, 'ms');
    console.log(results);

    const recursiveStart = performance.now();
    const resultsRecursive = findSubstringRecursive(search);
    const recursiveEnd = performance.now();
    console.log('Recursive search time:', recursiveEnd - recursiveStart, 'ms');
    console.log(resultsRecursive);

    return {
        buildTime: buildEnd - buildStart,
        searchTime: searchEnd - searchStart,
        recursiveSearchTime: recursiveEnd - recursiveStart,
    };
}

function testEmojis() {
    let searchString = '';
    Object.values(enEmojis).forEach(({keywords}) => {
        searchString += `${keywords.join('')}{`;
    });
    return performanceProfile(searchString, 'smile');
}

console.log('Read string of length', DATA.length);
function runTest() {
    return performanceProfile(DATA);
}

export {makeTree, stringToArray, runTest, testEmojis};
