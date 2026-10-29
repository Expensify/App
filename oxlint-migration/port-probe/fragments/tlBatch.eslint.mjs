import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

// Loaded the same way the base config loads its plugins: require() of the absolute path under
// node_modules, so CJS/ESM interop differences do not matter here.
const lodash = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-lodash'));

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

export default [
    {
        // The `testing-library` plugin is already registered for **/*.ts and **/*.tsx by the base
        // probe config, and ESLint 9 rejects a second object under the same name, so this block only
        // narrows the rules down to this shard's fixture.
        files: ['**/tlBatchTest.tsx'],
        rules: {
            'testing-library/await-async-queries': 'error',
            'testing-library/await-async-utils': 'error',
            'testing-library/no-manual-cleanup': 'error',
            'testing-library/no-unnecessary-act': 'error',
            'testing-library/prefer-find-by': 'error',
            'testing-library/prefer-presence-queries': 'error',
            'testing-library/prefer-screen-queries': 'error',
        },
    },
    {
        // eslint-plugin-lodash is wired nowhere else in the probe config, so this shard declares it.
        files: ['**/tlBatchLodash.ts'],
        plugins: {lodash: plugin(lodash)},
        rules: {
            'lodash/import-scope': ['error', 'method'],
        },
    },
];
