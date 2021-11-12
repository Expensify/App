module.exports = {
    extends: [
        'expensify',
        'plugin:react-native-a11y/all',
    ],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js'],
    plugins: ['detox'],
    env: {
        jest: true,
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
};
