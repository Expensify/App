module.exports = {
    extends: ['expensify', 'airbnb-typescript', 'plugin:storybook/recommended', 'plugin:react-hooks/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint', 'react-hooks'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', '.git/**'],
    env: {
        jest: true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
            },
        },
    },
    globals: {
        __DEV__: 'readonly',
    },
    rules: {
        "import/no-extraneous-dependencies": "off",
        'rulesdir/onyx-props-must-have-default': 'off',
        'react/jsx-filename-extension': [1, {extensions: ['.tsx', '.ts', '.jsx', '.js']}],
        "@typescript-eslint/no-var-requires": "off",
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        'es/no-nullish-coalescing-operators': 'off',
        'es/no-optional-chaining': 'off',
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'react-native',
                        importNames: ['useWindowDimensions'],
                        message: 'Please use useWindowDimensions from src/hooks/useWindowDimensions instead',
                    },
                    {
                        name: 'react-native',
                        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
                        message: 'Please use PressableWithFeedback and/or PressableWithoutFeedback from src/components/Pressable instead',
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
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        paths: [
                            {
                                name: 'lodash/get',
                                message: 'Please use optional chaining and nullish coalescing instead.',
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
