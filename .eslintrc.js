module.exports = {
    extends: 'expensify',
    parser: 'babel-eslint',
    rules: {
        'react/jsx-filename-extension': [1, {extensions: ['.js']}],
    },
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
