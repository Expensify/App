module.exports = {
    rules: {
        'no-import-assign': 'off',
        '@lwc/lwc/no-async-await': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],

        // This helps disable the `prefer-alias` rule for tests
        '@dword-design/import-alias/prefer-alias': ['off'],
    },
};
