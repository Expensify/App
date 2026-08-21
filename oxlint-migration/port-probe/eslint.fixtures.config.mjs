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
// an in-repo local rule; require() of an ESM module returns its namespace, which is {name, meta, create}
const requireLocaleForLocalizedDateFormat = fromRepo('eslint-plugin-local-rules/require-locale-for-localized-date-format.js');
// the same nested copy oxlint's rh-plugin.mjs loads, so both tools run one plugin instance
const reactHooks = fromRepo('node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks');

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

/**
 * Standalone ESLint config for the port-probe fixtures: only the rules under test, each with the
 * exact option values the repo config uses. Run with --no-config-lookup, because the repo's
 * type-aware config excludes oxlint-migration from the TS program and would fail to parse the fixtures.
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
            rulesdir: {rules: {'no-inline-useOnyx-selector': noInlineUseOnyxSelector, 'require-locale-for-localized-date-format': requireLocaleForLocalizedDateFormat}},
        },
        // propWrapperFunctions mirrors the repo config plus one entry the repo does not have, the
        // object form {property: 'exact', exact: true}. See oxlint.fixtures.json for why: the repo's
        // plain strings leave react/prefer-exact-props inert on both tools, so without this the rule
        // could not be covered at all.
        settings: {react: {version: 'detect'}, propWrapperFunctions: ['forbidExtraProps', 'exact', 'Object.freeze', {property: 'exact', exact: true}]},
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
            'rulesdir/require-locale-for-localized-date-format': 'error',
            // wired 2026-08-11: ESLint core and plugin rules oxlint has no native port for, hosted
            // through the core/ and hosted/ aliases. Options copied from eslint-config-expensify.
            // the full nine-selector array from eslint-config-expensify, because the selectors are the
            // rule: a bridge that mishandles the regex attribute matches or the `:not(:has(...))` would
            // still pass a one-selector fixture
            'no-restricted-syntax': [
                'error',
                {selector: 'TSEnumDeclaration', message: "Please don't declare enums, use union types instead."},
                {
                    selector: 'CallExpression[callee.object.name="React"][callee.property.name="forwardRef"]',
                    message: 'forwardRef is deprecated. Please use ref as a prop instead. See: contributingGuides/STYLE.md#forwarding-refs',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@libs/]',
                    message: 'Namespace imports from @libs are not allowed. Use named imports instead. Example: import { method } from "@libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@userActions/]',
                    message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@userActions/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]',
                    message: 'Namespace imports from parent directories are not allowed. Use named imports instead. Example: import { method } from "../libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\./]',
                    message: 'Namespace imports from sibling modules are not allowed. Use named imports instead. Example: import { method } from "./libs/module"',
                },
                {
                    selector:
                        'JSXElement[openingElement.name.name=/^Pressable(WithoutFeedback|WithFeedback|WithDelayToggle|WithoutFocus)$/]:not(:has(JSXAttribute[name.name="sentryLabel"]))',
                    message: 'All Pressable components must include sentryLabel prop for Sentry tracking. Example: <PressableWithoutFeedback sentryLabel="MoreMenu-ExportFile" />',
                },
                {selector: 'LabeledStatement', message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'},
                {
                    selector: 'WithStatement',
                    message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize. It is also deprecated.',
                },
            ],
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
        // The eslint-plugin-react-hooks rules, scoped to the rh* fixtures for the same reasons as in
        // oxlint.fixtures.json: they run the React Compiler over every file they see, and the other
        // fixtures contain components that would report shapes no manifest entry claims.
        // rules-of-hooks is absent because production runs oxlint's native port of it, not the
        // sidecar copy. The dynamic-gating options that used to be scoped to rhGating.tsx are gone
        // with the rule: oxlint dropped react-hooks/gating on 2026-08-21 when the other 12 compiler
        // rules moved to rc/* over the Rust compiler, so there is nothing left to compare against.
        // Production passes the compiler no gating options either, which is why the rule cannot fire
        // in either tool outside that removed block.
        files: ['**/rh*.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {sourceType: 'module', ecmaFeatures: {jsx: true}}},
        plugins: {'react-hooks': {rules: reactHooks.rules}},
        rules: {
            'react-hooks/component-hook-factories': 'error',
            'react-hooks/config': 'error',
            'react-hooks/error-boundaries': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react-hooks/gating': 'error',
            'react-hooks/globals': 'error',
            'react-hooks/immutability': 'error',
            'react-hooks/incompatible-library': 'error',
            'react-hooks/preserve-manual-memoization': 'error',
            'react-hooks/purity': 'error',
            'react-hooks/refs': 'error',
            'react-hooks/set-state-in-effect': 'error',
            'react-hooks/set-state-in-render': 'error',
            'react-hooks/static-components': 'error',
            'react-hooks/unsupported-syntax': 'error',
            'react-hooks/use-memo': 'error',
        },
    },
    {
        // Scoped to one file because the rule throws on any *read* of `.propTypes` once an exact
        // wrapper is configured, and reactPropTypes.tsx contains one deliberately. See the header
        // comment in fixtures/reactExactProps.tsx.
        files: ['**/reactExactProps.tsx'],
        rules: {'react/prefer-exact-props': 'error'},
    },
    {
        // no-octal and no-octal-escape can only be violated in script mode: in a module the legacy
        // syntax is a parse error on both tools. ESLint gives .cjs sourceType commonjs by default,
        // and oxlint parses .cjs as a script, so the fixture is linted the same way by both.
        files: ['**/*.cjs'],
        rules: {
            'no-octal': 'error',
            'no-octal-escape': 'error',
            // plain-JS only in the repo config, since typescript-eslint switches all three off for
            // TS. no-dupe-args additionally needs sloppy mode, which is the other reason this block
            // is the only one that enables them.
            'dot-notation': ['error', {allowKeywords: true, allowPattern: ''}],
            'no-dupe-args': 'error',
            'no-return-await': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
];
