// Rules that are still *candidates* for the production oxlint config, hosted here so the
// fixture harness can prove they behave like ESLint's before anyone wires them up.
//
// Everything that has already graduated now comes from the production plugins
// (../core-rules.mjs, ../hosted-rules.mjs, ../expensify-rules.mjs) — the harness loads
// those directly, so it tests the real thing rather than a copy.
//
// What is left here:
//   jsx-no-constructed-context-values  eslint-plugin-react — needs the per-file
//                                      React-Compiler gate before it can be enabled
//                                      (ESLint's processor drops it wholesale in files
//                                      both compilers memoize)
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const react = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-react'));
const rules = react?.rules ?? react?.default?.rules ?? {};

const plugin = {
    meta: {name: 'pp', version: '0.0.1'},
    rules: {
        'jsx-no-constructed-context-values': rules['jsx-no-constructed-context-values'],
    },
};

export default plugin;
