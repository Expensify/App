module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended', 'plugin:react-hooks/recommended', 'prettier'],
    plugins: ['react-hooks'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', '.git/**'],
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
                'no-restricted-imports': [
                    'error',
                    {
                        paths: [
                            {
                                name: 'react-native',
                                importNames: ['useWindowDimensions'],
                                message: 'Please use useWindowDimensions from src/hooks/useWindowDimensions instead.',
                            },
                            {
                                name: 'react-native',
                                importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
                                message: 'Please use PressableWithFeedback and/or PressableWithoutFeedback from src/components/Pressable instead.',
                            },
                            {
                                name: 'react-native',
                                importNames: ['StatusBar'],
                                message: 'Please use StatusBar from src/libs/StatusBar instead',
                            },
                        ],
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
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                'expensify',
                'airbnb-typescript',
                'plugin:storybook/recommended',
                'plugin:react-hooks/recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'prettier',
            ],
            plugins: ['@typescript-eslint', 'react-hooks'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                'react/static-property-placement': 'off',
                'import/no-extraneous-dependencies': 'off',
                'rulesdir/onyx-props-must-have-default': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-non-null-assertion': 'error',
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                'es/no-nullish-coalescing-operators': 'off',
                'es/no-optional-chaining': 'off',
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
                                importNames: ['get'],
                                message: 'Please use optional chaining and nullish coalescing instead.',
                            },
                        ],
                    },
                ],
                'valid-jsdoc': 'off',
                'react/default-props-match-prop-types': 'off',
                'react/require-default-props': 'off',
            },
        },
    ],
};
