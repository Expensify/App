import {createRequire} from 'node:module';
// Shard for the importNativeBatch fixtures: the import/* rules oxlint implements natively. Severities and
// options are the production ones -- oxlint.config.mts for the oxlint side, and what `eslint --print-config`
// resolves for the production ESLint config on the ESLint side (both agree: bare "error" except
// consistent-type-specifier-style prefer-top-level and extensions' ignorePackages + never map).
// The two rules production scopes to plain JS (import/named, and import/no-named-as-default-member, which is
// root-on and switched off for TS) are scoped to the .js fixture here for the same reason.
//
// import/no-absolute-path is configured on its own fixture file. ESLint's import/extensions adds a
// "Missing file extension" finding for every specifier it cannot resolve, and an absolute specifier never
// resolves, so the two rules cannot share a file at parity counts: ESLint would report 2 where oxlint
// reports 1. oxlint needs --import-plugin for the same reason its config needs plugins: ["import"] at the
// root -- oxlint.config.mts has it there -- and the fragment format has no root plugins key, so the flag in
// importNativeBatch.oxlint.json carries it. Without that flag oxlint still reports the syntactic import
// rules but goes silent on every rule that has to resolve a module (no-self-import, named,
// no-named-as-default-member), silently, which is exactly the failure this probe exists to catch.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

// The same package instance the base probe config hands ESLint, so no rule id below can be a phantom.
const importPlugin = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-import'));
const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

// Verbatim from config/eslint/eslint.config.mjs, adapted to the fixtures dir by being relative to each linted
// file: eslint-plugin-import resolves specifiers against the importing file, and without the node resolver's
// extension list `./importNativeBatchHelper` does not resolve to the .ts helper, so import/named and
// import/no-named-as-default-member would report 0 for the wrong reason.
const resolverSettings = {
    'import/resolver': {
        node: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts', '.cts', '.mts'],
        },
    },
    'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts', '.cts', '.mts'],
    'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts', '.cts', '.mts'],
    },
};

const typescriptRules = {
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/extensions': ['error', 'ignorePackages', {js: 'never', mjs: 'never', jsx: 'never', ts: 'never', tsx: 'never', cts: 'never', mts: 'never'}],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-amd': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-default': 'error',
    'import/no-self-import': 'error',
    'import/no-webpack-loader-syntax': 'error',
};

const absolutePathRules = {
    'import/no-absolute-path': 'error',
};

const javascriptRules = {
    'import/named': 'error',
    'import/no-named-as-default-member': 'error',
};

const absent = [...Object.keys(typescriptRules), ...Object.keys(absolutePathRules), ...Object.keys(javascriptRules)].filter((id) => !plugin(importPlugin).rules[id.replace('import/', '')]);
if (absent.length) {
    throw new Error(`eslint-plugin-import has no rules: ${absent.join(', ')}`);
}

export default [
    {
        files: ['**/importNativeBatch.ts'],
        settings: resolverSettings,
        rules: typescriptRules,
    },
    {
        files: ['**/importNativeBatchAbsolute.ts'],
        settings: resolverSettings,
        rules: absolutePathRules,
    },
    {
        // The base config registers the import plugin for **/*.ts and **/*.tsx only, and ESLint 9 rejects a
        // second definition of the same key with a different object, so the plain-JS fixture carries its own
        // registration -- the identical object, required from the same absolute path.
        files: ['**/importNativeBatchJs.js'],
        plugins: {import: plugin(importPlugin)},
        settings: resolverSettings,
        rules: javascriptRules,
    },
];
