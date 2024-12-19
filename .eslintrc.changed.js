module.exports = {
    plugins: ['@typescript-eslint', 'deprecation'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'deprecation/deprecation': 'error',
        'rulesdir/no-default-id-values': 'error',
    },
    overrides: [
        {
            files: ['src/libs/ReportUtils.ts', 'src/libs/actions/IOU.ts', 'src/libs/actions/Report.ts', 'src/libs/actions/Task.ts', 'src/pages/home/ReportScreen.tsx'],
            rules: {
                'rulesdir/no-default-id-values': 'off',
            },
        },
    ],
};
