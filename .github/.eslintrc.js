module.exports = {
    rules: {
        // For all these Node.js scripts, we do not want to disable `console` statements
        'no-console': 'off',

        '@lwc/lwc/no-async-await': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-continue': 'off',
        'no-restricted-imports': 'off',
    },
};
