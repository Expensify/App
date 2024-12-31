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
                'src/libs/actions/IOU.ts',
                'src/libs/actions/Report.ts',
                'src/libs/actions/Task.ts',
                'src/libs/OptionsListUtils.ts',
                'src/libs/TransactionUtils/index.ts',
                'src/pages/home/ReportScreen.tsx',
                'src/pages/workspace/WorkspaceInitialPage.tsx',
                'src/pages/home/report/PureReportActionItem.tsx',
            ],
            rules: {
                'rulesdir/no-default-id-values': 'off',
            },
        },
    ],
};
