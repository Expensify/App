import {createRequire} from 'node:module';
// Shard for the ydnlBatch fixture: the 70 you-dont-need-lodash-underscore rules production enables as bare
// "error" (config/eslint/eslint.config.mjs extends plugin:you-dont-need-lodash-underscore/all and turns off
// only throttle and clone-deep). Scoped to the batch's own fixture so it cannot report on repo source.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

// Loaded exactly like the base probe config loads it: require() of the absolute path under node_modules, so
// the CJS/ESM interop of this package (module.exports.rules) is handled the same way on both sides.
const lodashUnderscore = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-you-dont-need-lodash-underscore'));
const rules = (lodashUnderscore?.rules ?? lodashUnderscore?.default?.rules) || {};

const enabled = [
    'all',
    'any',
    'assign',
    'bind',
    'capitalize',
    'cast-array',
    'collect',
    'concat',
    'contains',
    'defaults',
    'detect',
    'drop',
    'drop-right',
    'each',
    'ends-with',
    'entries',
    'every',
    'extend-own',
    'fill',
    'filter',
    'find',
    'find-index',
    'first',
    'flatten',
    'foldl',
    'foldr',
    'for-each',
    'get',
    'head',
    'includes',
    'index-of',
    'inject',
    'is-array',
    'is-array-buffer',
    'is-date',
    'is-finite',
    'is-function',
    'is-integer',
    'is-nan',
    'is-nil',
    'is-null',
    'is-string',
    'is-undefined',
    'join',
    'keys',
    'last',
    'last-index-of',
    'map',
    'omit',
    'pad-end',
    'pad-start',
    'pairs',
    'reduce',
    'reduce-right',
    'repeat',
    'replace',
    'reverse',
    'select',
    'size',
    'slice',
    'some',
    'split',
    'starts-with',
    'take-right',
    'to-lower',
    'to-pairs',
    'to-upper',
    'trim',
    'union-by',
    'values',
];

const absent = enabled.filter((name) => !rules[name]);
if (absent.length) {
    throw new Error(`eslint-plugin-you-dont-need-lodash-underscore has no rules: ${absent.join(', ')}`);
}

// The plugin itself is NOT re-registered here. The base config already registers this exact plugin name for
// **/*.ts, and ESLint 9 rejects a second definition of the same key with a different object
// ("Cannot redefine plugin"), so a shard may only add rules for a plugin the base already provides. The
// require() above still has to succeed: it is what proves every id below is a real rule of the same package
// instance the base config hands ESLint.
export default [
    {
        files: ['**/ydnlBatch*.ts'],
        rules: Object.fromEntries(enabled.map((name) => [`you-dont-need-lodash-underscore/${name}`, 'error'])),
    },
];
