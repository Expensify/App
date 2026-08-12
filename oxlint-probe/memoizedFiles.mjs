// Batch version of the React Compiler memoization check, for tooling that needs the answer for
// many files at once. scripts/check-both-compilers-runner.mjs handles one file per process, which
// costs ~1 s of compiler startup each; this loads the compilers once.
//
//     node oxlint-probe/memoizedFiles.mjs <file-with-one-path-per-line>   -> {"path": true, ...}
//
// The two skips mirror config/eslint/processors/eslint-processor-react-compiler-compat.mjs
// exactly. They matter: the processor treats every file under tests/ as NOT memoized regardless
// of what the compilers say, so its messages are never filtered there.
import fs from 'node:fs';

import {didBothCompilersMemoizeFile} from '../config/reactCompiler/checkBoth.mjs';

const paths = [...new Set(fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean))];
const result = {};

for (const path of paths) {
    if (path.includes('/tests/') || path.startsWith('tests/') || path.includes('node_modules/')) {
        result[path] = false;
        continue;
    }
    try {
        result[path] = didBothCompilersMemoizeFile(fs.readFileSync(path, 'utf8'), path);
    } catch {
        result[path] = false;
    }
}

process.stdout.write(JSON.stringify(result, null, 2));
