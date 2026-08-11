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
            '@typescript-eslint': tseslint.plugin,
            react: plugin(react),
            import: plugin(importPlugin),
            jsdoc: plugin(jsdoc),
            'testing-library': plugin(testingLibrary),
            'you-dont-need-lodash-underscore': plugin(lodashUnderscore),
            'react-native-a11y': plugin(reactNativeA11y),
            rulesdir: {rules: {'no-inline-useOnyx-selector': noInlineUseOnyxSelector}},
        },
        // propWrapperFunctions mirrors the repo config and is load-bearing: react/prefer-exact-props
        // reports nothing unless it knows which wrappers count as exact.
        settings: {react: {version: 'detect'}, propWrapperFunctions: ['forbidExtraProps', 'exact', 'Object.freeze']},
        rules: {
            // port candidates: rules oxlint either lacks or implements differently
            'no-unreachable-loop': ['error', {ignore: []}],
            'react/jsx-no-bind': ['error', {ignoreRefs: true, allowArrowFunctions: true, allowFunctions: false, allowBind: false, ignoreDOMComponents: true}],
            'react/function-component-definition': ['error', {namedComponents: 'function-declaration', unnamedComponents: 'arrow-function'}],
            'react/jsx-no-constructed-context-values': 'error',
            'import/prefer-default-export': 'error',
            'import/order': ['error', {groups: [['builtin', 'external', 'internal']]}],
            'jsdoc/no-types': 'error',
            // exactly eslint-config-expensify's five selector groups (configs/public/typescript.js)
            '@typescript-eslint/naming-convention': [
                'error',
                {selector: ['variable', 'property'], format: null, filter: {regex: '^__esModule$', match: true}},
                {selector: ['variable', 'property'], format: ['camelCase', 'UPPER_CASE', 'PascalCase'], filter: {regex: '^private_[a-z][a-zA-Z0-9]*$', match: false}},
                {selector: 'function', format: ['camelCase', 'PascalCase']},
                {selector: ['typeLike', 'enumMember'], format: ['PascalCase']},
                {selector: ['parameter', 'method'], format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow'},
            ],
            'rulesdir/no-inline-useOnyx-selector': 'error',
            // wired 2026-08-11: ESLint core and plugin rules oxlint has no native port for, hosted
            // through the core/ and hosted/ aliases. Options copied from eslint-config-expensify.
            strict: ['error', 'never'],
            'one-var': ['error', 'never'],
            'no-undef-init': 'error',
            'no-new-object': 'error',
            'lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: false}],
            'import/no-import-module-exports': ['error', {exceptions: []}],
            'import/no-relative-packages': 'error',
            'import/no-useless-path-segments': ['error', {commonjs: true}],
            'react/default-props-match-prop-types': ['error', {allowRequiredDefaults: false}],
            'react/forbid-foreign-prop-types': ['error', {allowInPropTypes: true}],
            'react/forbid-prop-types': ['error', {forbid: ['any', 'array', 'object'], checkContextTypes: true, checkChildContextTypes: true}],
            'react/no-access-state-in-setstate': 'error',
            'react/no-arrow-function-lifecycle': 'error',
            'react/no-deprecated': 'error',
            'react/no-invalid-html-attribute': 'error',
            'react/no-typos': 'error',
            'react/no-unused-class-component-methods': 'error',
            'react/no-unused-prop-types': ['error', {customValidators: [], skipShapeProps: true}],
            'react/no-unused-state': 'error',
            'react/prefer-exact-props': 'error',
            'react/prefer-stateless-function': ['error', {ignorePureComponents: true}],
            'react/sort-comp': [
                'error',
                {
                    order: [
                        'static-variables',
                        'static-methods',
                        'instance-variables',
                        'lifecycle',
                        '/^handle.+$/',
                        '/^on.+$/',
                        'getters',
                        'setters',
                        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
                        'instance-methods',
                        'everything-else',
                        'rendering',
                    ],
                    groups: {
                        lifecycle: [
                            'displayName',
                            'propTypes',
                            'contextTypes',
                            'childContextTypes',
                            'mixins',
                            'statics',
                            'defaultProps',
                            'constructor',
                            'getDefaultProps',
                            'getInitialState',
                            'state',
                            'getChildContext',
                            'getDerivedStateFromProps',
                            'componentWillMount',
                            'UNSAFE_componentWillMount',
                            'componentDidMount',
                            'componentWillReceiveProps',
                            'UNSAFE_componentWillReceiveProps',
                            'shouldComponentUpdate',
                            'componentWillUpdate',
                            'UNSAFE_componentWillUpdate',
                            'getSnapshotBeforeUpdate',
                            'componentDidUpdate',
                            'componentDidCatch',
                            'componentWillUnmount',
                        ],
                        rendering: ['/^render.+$/', 'render'],
                    },
                },
            ],
            'react/static-property-placement': ['error', 'property assignment'],
            // already enabled on both sides, but absent from oxlint's JSON schema
            'you-dont-need-lodash-underscore/uniq': 'error',
            'testing-library/no-debugging-utils': 'error',
            'react-native-a11y/has-valid-accessibility-descriptors': 'error',
            // noise the probe does not care about
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
    {
        // no-octal and no-octal-escape can only be violated in script mode: in a module the legacy
        // syntax is a parse error on both tools. ESLint gives .cjs sourceType commonjs by default,
        // and oxlint parses .cjs as a script, so the fixture is linted the same way by both.
        files: ['**/*.cjs'],
        rules: {
            'no-octal': 'error',
            'no-octal-escape': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
];
