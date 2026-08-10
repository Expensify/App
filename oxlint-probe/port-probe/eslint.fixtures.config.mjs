import js from '@eslint/js';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fromRepo = (relative) => require(path.resolve(here, '../..', relative));

// Loaded through require() so CJS/ESM interop differences between these plugins do not matter
const react = fromRepo('node_modules/eslint-plugin-react');
const importPlugin = fromRepo('node_modules/eslint-plugin-import');
const jsdoc = fromRepo('node_modules/eslint-plugin-jsdoc');
const testingLibrary = fromRepo('node_modules/eslint-plugin-testing-library');
const lodashUnderscore = fromRepo('node_modules/eslint-plugin-you-dont-need-lodash-underscore');
const reactNativeA11y = fromRepo('node_modules/eslint-plugin-react-native-a11y');
// package-relative resolution of this one is blocked by the package's "exports" field
const noInlineUseOnyxSelector = fromRepo('node_modules/eslint-config-expensify/eslint-plugin-expensify/no-inline-useOnyx-selector.js');

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

/**
 * Standalone ESLint config for the port-probe fixtures: only the rules under test, each with the
 * exact option values the repo config uses. Run with --no-config-lookup, because the repo's
 * type-aware config excludes oxlint-probe from the TS program and would fail to parse the fixtures.
 */
export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
        plugins: {
            react: plugin(react),
            import: plugin(importPlugin),
            jsdoc: plugin(jsdoc),
            'testing-library': plugin(testingLibrary),
            'you-dont-need-lodash-underscore': plugin(lodashUnderscore),
            'react-native-a11y': plugin(reactNativeA11y),
            rulesdir: {rules: {'no-inline-useOnyx-selector': noInlineUseOnyxSelector}},
        },
        settings: {react: {version: 'detect'}},
        rules: {
            // port candidates: rules oxlint either lacks or implements differently
            'no-unreachable-loop': ['error', {ignore: []}],
            'react/jsx-no-bind': ['error', {ignoreRefs: true, allowArrowFunctions: true, allowFunctions: false, allowBind: false, ignoreDOMComponents: true}],
            'react/function-component-definition': ['error', {namedComponents: 'function-declaration', unnamedComponents: 'arrow-function'}],
            'react/jsx-no-constructed-context-values': 'error',
            'import/prefer-default-export': 'error',
            'import/order': ['error', {groups: [['builtin', 'external', 'internal']]}],
            'jsdoc/no-types': 'error',
            'rulesdir/no-inline-useOnyx-selector': 'error',
            // already enabled on both sides, but absent from oxlint's JSON schema
            'you-dont-need-lodash-underscore/uniq': 'error',
            'testing-library/no-debugging-utils': 'error',
            'react-native-a11y/has-valid-accessibility-descriptors': 'error',
            // noise the probe does not care about
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
];
