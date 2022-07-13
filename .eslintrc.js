module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'node_modules/.bin/**', '.git/**'],
    env: {
        jest: true,
    },
    rules: {
        'react/forbid-prop-types': ['off'],
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
