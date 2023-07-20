module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended', 'plugin:react-hooks/recommended', 'prettier', 'plugin:react-native-a11y/basic'],
    plugins: ['react-hooks', 'react-native-a11y'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', 'node_modules/.cache/**', '.git/**'],
    env: {
        jest: true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.website.js', '.desktop.js', '.native.js', '.ios.js', '.android.js', '.config.js'],
            },
        },
    },
    globals: {
        __DEV__: 'readonly',
    },
    rules: {
        'no-restricted-imports': [
            'error',
            {
                paths: [
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
                ],
            },
        ],
        'react-native-a11y/has-accessibility-hint': ['off'],
        'react-native-a11y/has-valid-accessibility-descriptors': [
            'error',
            {
                touchables: ['PressableWithoutFeedback', 'PressableWithFeedback'],
            },
        ],
    },
};
