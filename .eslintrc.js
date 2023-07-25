const globalRestrictedImport = [
    {
        name: 'react-native',
        importNames: ['useWindowDimensions', 'StatusBar', 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable'],
        message: [
            '',
            "For 'useWindowDimensions', please use 'src/hooks/useWindowDimensions' instead.",
            "For 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from 'src/components/Pressable' instead.",
            "For 'StatusBar', please use 'src/libs/StatusBar' instead.",
        ].join('\n'),
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
        message: "Please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from 'src/components/Pressable' instead.",
    },
];

module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended', 'plugin:react-hooks/recommended', 'prettier', 'plugin:react-native-a11y/basic'],
    plugins: ['react-hooks', 'react-native-a11y'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', 'node_modules/.cache/**', '.git/**'],
    env: {
        jest: true,
    },
    globals: {
        __DEV__: 'readonly',
    },
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            rules: {
                'react-native-a11y/has-accessibility-hint': ['off'],
                'react-native-a11y/has-valid-accessibility-descriptors': [
                    'error',
                    {
                        touchables: ['PressableWithoutFeedback', 'PressableWithFeedback'],
                    },
                ],
            },
        },
        {
            files: ['*.js', '*.jsx'],
            settings: {
                'import/resolver': {
                    node: {
                        extensions: ['.js', '.website.js', '.desktop.js', '.native.js', '.ios.js', '.android.js', '.config.js', '.ts', '.tsx'],
                    },
                },
            },
            rules: {
                'import/extensions': [
                    'error',
                    'ignorePackages',
                    {
                        js: 'never',
                        jsx: 'never',
                        ts: 'never',
                        tsx: 'never',
                    },
                ],
                'no-restricted-imports': [
                    'error',
                    {
                        paths: globalRestrictedImport,
                    },
                ],
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                'airbnb-typescript',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:you-dont-need-lodash-underscore/all',
                'prettier',
            ],
            plugins: ['@typescript-eslint', 'jsdoc', 'you-dont-need-lodash-underscore'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                // TODO: Remove the following rules after TypeScript migration is complete.
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',

                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        selector: ['variable', 'property'],
                        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    },
                    {
                        selector: 'function',
                        format: ['camelCase', 'PascalCase'],
                    },
                    {
                        selector: ['typeLike', 'enumMember'],
                        format: ['PascalCase'],
                    },
                    {
                        selector: ['parameter', 'method'],
                        format: ['camelCase'],
                    },
                ],
                '@typescript-eslint/ban-types': [
                    'error',
                    {
                        types: {
                            object: "Use 'Record<string, T>' instead.",
                        },
                        extendDefaults: true,
                    },
                ],
                '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
                '@typescript-eslint/no-unsafe-enum-comparison': 'error',
                '@typescript-eslint/prefer-enum-initializers': 'error',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-non-null-assertion': 'error',
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/switch-exhaustiveness-check': 'error',
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                'es/no-nullish-coalescing-operators': 'off',
                'es/no-optional-chaining': 'off',
                'valid-jsdoc': 'off',
                'jsdoc/no-types': 'error',
                'import/no-extraneous-dependencies': 'off',
                'rulesdir/onyx-props-must-have-default': 'off',
                'rulesdir/prefer-underscore-method': 'off',
                'rulesdir/prefer-import-module-contents': 'off',
                'react/require-default-props': 'off',
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'TSEnumDeclaration',
                        message: "Please don't declare enums, use union types instead.",
                    },
                ],
                'no-restricted-imports': [
                    'error',
                    {
                        paths: [
                            ...globalRestrictedImport,
                            {
                                name: 'lodash/get',
                                message: 'Please use optional chaining and nullish coalescing instead.',
                            },
                            {
                                name: 'lodash',
                                importNames: ['get'],
                                message: 'Please use optional chaining and nullish coalescing instead.',
                            },
                            {
                                name: 'underscore',
                                message: 'Please use the corresponding method from lodash instead',
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
