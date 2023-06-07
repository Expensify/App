module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended', 'plugin:react-hooks/recommended', 'prettier', 'plugin:react-native-a11y/basic'],
    plugins: ['react-hooks', 'react-native-a11y'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', '.git/**'],
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
                        importNames: ['useWindowDimensions'],
                        message: 'Please use useWindowDimensions from src/hooks/useWindowDimensions instead',
                    },
                    {
                        name: 'react-native',
                        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable'],
                        message: 'Please use PressableWithFeedback and/or PressableWithoutFeedback from src/components/Pressable instead',
                    },
                ],
            },
        ],
        'react-native-a11y/has-accessibility-hint': ['off'],
    },
};
