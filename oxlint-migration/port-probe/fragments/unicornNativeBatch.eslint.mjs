import {createRequire} from 'node:module';
// Shard for the unicornNativeBatch fixtures: the five unicorn/* rules eslint-config-expensify enables
// (configs/private/unicorn.js, all bare "error") plus unicorn/prefer-at, which oxlint.config.mts enables and the
// production ESLint config does not -- enabled here at default options so the prefer-at tripwire has an oracle.
// The base probe config does not wire this plugin, so this shard registers it for its own fixtures.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

// eslint-plugin-unicorn is ESM with an "exports" map, and it is eslint-config-expensify's own dependency, so
// require() of the absolute path resolves the one copy production lints with.
const unicorn = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-unicorn'));
const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

const productionRules = {
    'unicorn/no-array-for-each': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-set-has': 'error',
    'unicorn/prefer-set-size': 'error',
    'unicorn/prefer-string-replace-all': 'error',
};

const oxlintOnlyRules = {
    'unicorn/prefer-at': 'error',
};

const absent = [...Object.keys(productionRules), ...Object.keys(oxlintOnlyRules)].filter((id) => !plugin(unicorn).rules[id.replace('unicorn/', '')]);
if (absent.length) {
    throw new Error(`eslint-plugin-unicorn has no rules: ${absent.join(', ')}`);
}

export default [
    {
        files: ['**/unicornNativeBatch.ts'],
        languageOptions: {
            parserOptions: {
                // eslint-config-expensify's unicorn block sets this; without it the plugin's scope helpers
                // do not see Set and Array as builtins.
                globals: require(path.resolve(repoRoot, 'node_modules/globals')).builtin,
            },
        },
        plugins: {unicorn: plugin(unicorn)},
        rules: productionRules,
    },
    {
        files: ['**/unicornPreferAt.ts'],
        languageOptions: {
            parserOptions: {globals: require(path.resolve(repoRoot, 'node_modules/globals')).builtin},
        },
        plugins: {unicorn: plugin(unicorn)},
        rules: oxlintOnlyRules,
    },
];
