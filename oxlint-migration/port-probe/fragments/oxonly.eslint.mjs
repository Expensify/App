import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fromRepo = (relative) => require(path.resolve(here, '../../..', relative));

// Loaded through require(): the package main is a jiti CJS fallback, and the plugin's own ESM
// entry is not importable by specifier (no "exports" map, directory main).
const importAlias = fromRepo('node_modules/@dword-design/eslint-plugin-import-alias');

// The homemade plugin lives at the repo root's config/, three levels above fragments/.
const reportNameUtils = await import(pathToFileURL(path.resolve(here, '../../../config/eslint/plugins/eslint-plugin-report-name-utils.mjs')).href);

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

// Production's alias map (.oxlintrc.json and config/eslint/eslint.config.mjs agree on it) written
// out once. `@userActions` must stay ahead of `@libs` in the object order, like both configs do:
// the plugin takes the first alias whose directory contains the import.
const alias = {
    '@assets': './assets',
    '@components': './src/components',
    '@hooks': './src/hooks',
    '@userActions': './src/libs/actions',
    '@libs': './src/libs',
    '@navigation': './src/libs/Navigation',
    '@pages': './src/pages',
    '@prompts': './prompts',
    '@styles': './src/styles',
    '@src': './src',
    '@github': './.github',
};

export default [
    {
        // Same projectService/tsconfigRootDir shape as fragments/typedSample.eslint.mjs, so both
        // this shard and the anchor resolve types through fixtures/tsconfig.json.
        files: ['**/oxonlyTyped.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {projectService: true, tsconfigRootDir: path.join(here, '..', 'fixtures'), ecmaFeatures: {jsx: true}},
        },
        plugins: {'@typescript-eslint': tseslint.plugin},
        rules: {
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/only-throw-error': 'error',
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
            '@typescript-eslint/require-await': 'error',
        },
    },
    {
        // Bare 'error' on both sides, matching production's jsdoc override. No definedTags, no
        // tagNamePreference: the fixture violates the defaults. The plugin itself comes from the
        // shared **/*.ts block -- ESLint rejects a redeclaration in a later config object.
        files: ['**/oxonlyJsdoc.ts'],
        rules: {
            'jsdoc/check-tag-names': 'error',
            'jsdoc/require-param': 'error',
            'jsdoc/require-param-type': 'error',
        },
    },
    {
        // ESLint core rules, at production's options.
        files: ['**/oxonlyCore.ts'],
        rules: {
            'prefer-regex-literals': ['error', {disallowRedundantWrapping: true}],
            'arrow-body-style': ['error', 'as-needed', {requireReturnForObjectLiteral: false}],
            'no-unexpected-multiline': 'error',
        },
    },
    {
        files: ['**/oxonlyReportName.ts'],
        plugins: {'report-name-utils': plugin(reportNameUtils)},
        rules: {'report-name-utils/no-function-call-in-get-report-name': 'error'},
    },
    {
        // `plugin:@dword-design/import-alias/recommended` (what config/eslint/eslint.config.mjs
        // extends through FlatCompat) declares no settings of its own -- the rule reads only its
        // own options plus a babel module-resolver entry, and babel.config.js returns {} for lint
        // callers, so the map below is the whole configuration. Production's `import/resolver`
        // block exists to undo what that recommended config does to a different rule
        // (import/extensions), which this probe never enables.
        files: ['**/oxonlyAlias.ts'],
        plugins: {'@dword-design/import-alias': plugin(importAlias)},
        rules: {'@dword-design/import-alias/prefer-alias': ['error', {alias}]},
    },
];
