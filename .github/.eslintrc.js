module.exports = {
    rules: {
        // For all these Node.js scripts, we do not want to disable `console` statements
        'no-console': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-continue': 'off',
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['@src/**'],
                        message: 'Do not import files from src/ directory as they can break the GH Actions build script.',
                    },
                ],
            },
        ],
    },
};
