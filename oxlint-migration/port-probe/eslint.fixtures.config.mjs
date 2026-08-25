import js from '@eslint/js';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fromRepo = (relative) => require(path.resolve(here, '../..', relative));

// Loaded through require() so CJS/ESM interop differences between these plugins do not matter.
const react = fromRepo('node_modules/eslint-plugin-react');
const importPlugin = fromRepo('node_modules/eslint-plugin-import');
const jsdoc = fromRepo('node_modules/eslint-plugin-jsdoc');
const testingLibrary = fromRepo('node_modules/eslint-plugin-testing-library');
const lodashUnderscore = fromRepo('node_modules/eslint-plugin-you-dont-need-lodash-underscore');
const reactNativeA11y = fromRepo('node_modules/eslint-plugin-react-native-a11y');
// Package-relative resolution of this one is blocked by the package's "exports" field.
const noInlineUseOnyxSelector = fromRepo('node_modules/eslint-config-expensify/eslint-plugin-expensify/no-inline-useOnyx-selector.js');
// require() of an ESM module returns its namespace, which here is {name, meta, create}.
const requireLocaleForLocalizedDateFormat = fromRepo('eslint-plugin-local-rules/require-locale-for-localized-date-format.js');
// The same nested copy oxlint loads, so both tools run one plugin instance.
const reactHooks = fromRepo('node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks');

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

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
        // The extra object form {property: 'exact', exact: true} is not in the repo config: with only
        // the repo's plain strings, react/prefer-exact-props stays inert on both tools.
        settings: {react: {version: 'detect'}, propWrapperFunctions: ['forbidExtraProps', 'exact', 'Object.freeze', {property: 'exact', exact: true}]},
        rules: {
            'no-unreachable-loop': ['error', {ignore: []}],
            'react/jsx-no-bind': ['error', {ignoreRefs: true, allowArrowFunctions: true, allowFunctions: false, allowBind: false, ignoreDOMComponents: true}],
            'react/function-component-definition': ['error', {namedComponents: 'function-declaration', unnamedComponents: 'arrow-function'}],
            'react/jsx-no-constructed-context-values': 'error',
            'import/prefer-default-export': 'error',
            'import/order': ['error', {groups: [['builtin', 'external', 'internal']]}],
            'jsdoc/no-types': 'error',
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
            'you-dont-need-lodash-underscore/uniq': 'error',
            'testing-library/no-debugging-utils': 'error',
            'react-native-a11y/has-valid-accessibility-descriptors': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
    {
        // Scoped to the rh* fixtures because these rules run the React Compiler over every file they
        // see, and the other fixtures hold components that would report shapes no manifest entry claims.
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
        // wrapper is configured, and reactPropTypes.tsx contains one deliberately.
        files: ['**/reactExactProps.tsx'],
        rules: {'react/prefer-exact-props': 'error'},
    },
    {
        // no-octal and no-octal-escape can only be violated in script mode: in a module the legacy
        // syntax is a parse error on both tools. Both give .cjs a script/commonjs sourceType.
        files: ['**/*.cjs'],
        rules: {
            'no-octal': 'error',
            'no-octal-escape': 'error',
            // typescript-eslint switches all three off for TS, and no-dupe-args also needs sloppy mode.
            'dot-notation': ['error', {allowKeywords: true, allowPattern: ''}],
            'no-dupe-args': 'error',
            'no-return-await': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
];
