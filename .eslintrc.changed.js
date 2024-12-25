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
            files: [
                'src/libs/ReportUtils.ts',
                'src/libs/actions/IOU.ts',
                'src/libs/actions/Report.ts',
                'src/libs/actions/Task.ts',
                'src/libs/OptionsListUtils.ts',
                'src/libs/ReportActionsUtils.ts',
                'src/libs/TransactionUtils/index.ts',
                'src/pages/home/ReportScreen.tsx',
                'src/pages/workspace/WorkspaceInitialPage.tsx',
            ],
            rules: {
                'rulesdir/no-default-id-values': 'off',
            },
        },
    ],
};
