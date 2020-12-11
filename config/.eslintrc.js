module.exports = {
    extends: 'expensify',
    parser: 'babel-eslint',
    ignorePatterns: ['../src/vendor', '!../.github/actions/*'],
    rules: {
        'react/jsx-filename-extension': [1, {extensions: ['.js']}],
    },
    plugins: ['detox'],
    env: {
        jest: true
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
                ]
            }
        }
    }
};
