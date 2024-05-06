module.exports = {
    extends: ['plugin:testing-library/react'],
    rules: {
        'no-import-assign': 'off',
        '@lwc/lwc/no-async-await': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],

        // This helps disable the `prefer-alias` rule for tests
        '@dword-design/import-alias/prefer-alias': ['off'],

        'testing-library/await-async-queries': 'error',
        'testing-library/await-async-utils': 'error',
        'testing-library/no-debugging-utils': 'error',
        'testing-library/no-manual-cleanup': 'error',
        'testing-library/no-unnecessary-act': 'error',
        'testing-library/prefer-find-by': 'error',
        'testing-library/prefer-presence-queries': 'error',
        'testing-library/prefer-screen-queries': 'error',
    },
};
