module.exports = {
    extends: 'expensify',
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js'],
    rules: {
        'react/jsx-filename-extension': [1, {extensions: ['.js']}],
        'comma-dangle': ['error', 'always-multiline'],
        'import/group-exports': 'error',
        'import/prefer-default-export': 0,
        'es/no-nullish-coalescing-operators': 'error',
        'es/no-optional-chaining': 'error',

        /**
         * Custom rules from the eslint-local-rules directory
         */
        'local-rules/no-negated-variables': 'error',
        'local-rules/no-onyx-in-views': 'error',
        'local-rules/no-thenable-actions-in-views': 'error',
        'local-rules/prefer-early-return': 'error',
        'local-rules/no-inline-named-export': 'error',
        'local-rules/prefer-import-module-contents': 'error',
        'local-rules/prefer-underscore-method': 'error',
        'local-rules/no-useless-compose': 'error',
    },
    plugins: [
        'detox',
        'eslint-plugin-local-rules',
        'import',
        'eslint-plugin-es',
    ],
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
