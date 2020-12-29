module.exports = {
    extends: 'expensify',
    parser: 'babel-eslint',
    ignorePatterns: 'src/vendor',
    rules: {
        'react/jsx-filename-extension': [1, {extensions: ['.js']}],
        'comma-dangle': ['error', 'always-multiline'],
    },
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
                ],
            },
        },
    },
};
