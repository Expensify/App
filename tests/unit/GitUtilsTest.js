const GitUtils = require('../../.github/libs/GitUtils');

const data = [
    {
        input: [],
        expectedOutput: [],
    },
    {
        input: ['Some random commit message'],
        expectedOutput: [],
    },
    {
        input: [
            'Start adding StagingDeployCash logic',
            'Setting up bones',
            'Merge pull request #337 from Expensify/francoisUpdateQbdSyncManager',
            'Merge pull request #336 from Expensify/andrew-pr-cla',
            'Update QBD Sync Manager version',
            'Only run CLA on PR comments or events',
            'Merge pull request #331 from Expensify/marcaaron-killMoment',
            'Merge pull request #330 from Expensify/andrew-cla-update',
            'Merge pull request #333 from Expensify/Rory-AddOnOffSwitchTooltip',
            'Setup OnOffSwitch component with tooltips',
            'Merge pull request #332 from Expensify/alex-mechler-patch-1',
            'Return to old hash-based deploy instrcutions',
            'Remove DEFAULT_START_DATE & DEFAULT_END_DATE altogether',
        ],
        expectedOutput: ['337', '336', '331', '330', '333', '332'],
    },
    {
        input: [
            'Merge pull request #1521 from parasharrajat/parasharrajat/pdf-render',
            'Merge pull request #1563 from Expensify/version-bump-e6498075e301df3e9c8d7866ea391a23c19ed9b0',
            'Update version to 1.0.1-470',
            '[IS-1500] Updated textalignInput utility',
            'Merge pull request #2 from Expensify/main',
            'fix: set pdf width on large screens',
        ],
        expectedOutput: ['1521'],
    },
];

describe('GitUtils', () => {
    describe.each(data)('getValidMergedPRs', (exampleCase) => {
        test('getValidMergedPRs', () => {
            const result = GitUtils.getValidMergedPRs(exampleCase.input);
            expect(result).toStrictEqual(exampleCase.expectedOutput);
        });
    });
});
