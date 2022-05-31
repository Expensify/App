module.exports = {
    extends: 'expensify',
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js'],
    env: {
        jest: true,
        'react-native/react-native': true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: [
                    '.js',
                    '.website.js',
                    '.desktop.js',
                    '.native.js',
                    '.ios.js',
                    '.android.js',
                    '.config.js',
                ],
            },
        },
    },
    globals: {
        __DEV__: 'readonly',
    },
    plugins: ['react-native'],
    rules: {
        'react-native/no-unused-styles': ['error'],
        'react-native/split-platform-components': ['error'],
        'react-native/no-inline-styles': ['error'],
        'react-native/no-color-literals': ['error'],
        'react-native/no-raw-text': ['error'],
    },
};
