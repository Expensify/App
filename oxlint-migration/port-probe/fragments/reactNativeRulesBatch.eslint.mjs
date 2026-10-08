import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fromRepo = (relative) => require(path.resolve(here, '../../..', relative));
// The same nested copy the base config and oxlint both load, so all three run one plugin instance.
const reactHooks = fromRepo('node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks');
const react = fromRepo('node_modules/eslint-plugin-react');

// Three scoped blocks, mirroring the oxlint shard one for one, so a control in another file cannot
// add an unclaimed finding. `react` is already declared by the base config for **/*.tsx, so the two
// .tsx blocks only add rules -- redeclaring the name there would be an ESLint 9 error. The .jsx file
// matches no base block at all, so that one has to bring both the plugin and the JSX parser itself.
// react-hooks is declared in the base config only inside **/rh*.tsx, which is why rules-of-hooks
// needs it wired here.
export default [
    {
        files: ['**/reactNativeRulesA.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
        plugins: {'react-hooks': {rules: reactHooks.rules}},
        rules: {
            'react/jsx-boolean-value': ['error', 'never', {always: []}],
            'react/jsx-fragments': ['error', 'syntax'],
            'react/jsx-no-comment-textnodes': 'error',
            'react/jsx-no-script-url': ['error', [{name: 'Link', props: ['to']}]],
            'react/jsx-no-target-blank': ['error', {enforceDynamicLinks: 'always'}],
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-pascal-case': ['error', {allowAllCaps: true, ignore: []}],
            'react/no-array-index-key': 'error',
            'react/no-children-prop': 'error',
            'react/no-danger': 'error',
            'react/no-unescaped-entities': 'error',
            'react/self-closing-comp': 'error',
            'react/forbid-component-props': [
                'error',
                {
                    forbid: [
                        {
                            propName: 'fsClass',
                            allowedFor: ['View', 'Animated.View', 'Text', 'Pressable'],
                            message:
                                "The 'fsClass' prop doesn't work for custom components, only RN's View, Text and Pressable.\nPlease use the 'ForwardedFSClassProps' or 'MultipleFSClassProps' types to pass down the desired 'fsClass' value to the allowed components.",
                        },
                    ],
                },
            ],
            'react-hooks/rules-of-hooks': 'error',
        },
    },
    {
        files: ['**/reactNativeRulesB.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
        rules: {
            'react/no-did-update-set-state': 'error',
            'react/no-will-update-set-state': 'error',
            'react/no-redundant-should-component-update': 'error',
            'react/state-in-constructor': ['error', 'always'],
            'react/no-unsafe': ['error', {checkAliases: true}],
        },
    },
    {
        files: ['**/reactNativeRulesC.jsx'],
        languageOptions: {ecmaVersion: 'latest', sourceType: 'module', parserOptions: {ecmaFeatures: {jsx: true}}},
        plugins: {react: {rules: react.rules}},
        settings: {react: {version: 'detect'}},
        rules: {
            'react/jsx-no-duplicate-props': 'error',
            'react/jsx-no-undef': 'error',
            'react/no-namespace': 'error',
            'react/no-unknown-property': 'error',
            'react/no-string-refs': 'error',
            'react/no-this-in-sfc': 'error',
            'react/style-prop-object': 'error',
            'react/void-dom-elements-no-children': 'error',
            'react/prefer-es6-class': ['error', 'always'],
            'react/no-is-mounted': 'error',
            'react/require-render-return': 'error',
            'react/no-find-dom-node': 'error',
            'react/no-render-return-value': 'error',
        },
    },
];
