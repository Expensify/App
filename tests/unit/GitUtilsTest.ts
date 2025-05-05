import type {CommitType} from '../../.github/libs/GithubUtils';
import GitUtils from '../../.github/libs/GitUtils';

type ExampleDataType = {
    input: CommitType[];
    expectedOutput: number[];
};

const data: ExampleDataType[] = [
    {
        input: [],
        expectedOutput: [],
    },
    {
        input: [{commit: '1', subject: 'Some random commit message', authorName: 'test@gmail.com'}],
        expectedOutput: [],
    },
    {
        input: [
            {commit: '1', subject: 'Start adding StagingDeployCash logic', authorName: 'test@gmail.com'},
            {commit: '2', subject: 'Setting up bones', authorName: 'test@gmail.com'},
            {commit: '3', subject: 'Merge pull request #337 from Expensify/francoisUpdateQbdSyncManager', authorName: 'test@gmail.com'},
            {commit: '4', subject: 'Merge pull request #336 from Expensify/andrew-pr-cla', authorName: 'test@gmail.com'},
            {commit: '5', subject: 'Update QBD Sync Manager version', authorName: 'test@gmail.com'},
            {commit: '6', subject: 'Only run CLA on PR comments or events', authorName: 'test@gmail.com'},
            {commit: '7', subject: 'Merge pull request #331 from Expensify/marcaaron-killMoment', authorName: 'test@gmail.com'},
            {commit: '8', subject: 'Merge pull request #330 from Expensify/andrew-cla-update', authorName: 'test@gmail.com'},
            {commit: '9', subject: 'Merge pull request #333 from Expensify/Rory-AddOnOffSwitchTooltip', authorName: 'test@gmail.com'},
            {commit: '10', subject: 'Setup OnOffSwitch component with tooltips', authorName: 'test@gmail.com'},
            {commit: '11', subject: 'Merge pull request #332 from Expensify/alex-mechler-patch-1', authorName: 'test@gmail.com'},
            {commit: '12', subject: 'Return to old hash-based deploy instrcutions', authorName: 'test@gmail.com'},
            {commit: '12', subject: 'Remove DEFAULT_START_DATE & DEFAULT_END_DATE altogether', authorName: 'test@gmail.com'},
        ],
        expectedOutput: [337, 336, 331, 330, 333, 332],
    },
    {
        input: [
            {commit: '1', subject: 'Merge pull request #1521 from parasharrajat/parasharrajat/pdf-render', authorName: 'test@gmail.com'},
            {commit: '3', subject: 'Update version to 1.0.1-470', authorName: 'test@gmail.com'},
            {commit: '4', subject: '[IS-1500] Updated textalignInput utility', authorName: 'test@gmail.com'},
            {commit: '5', subject: 'fix: set pdf width on large screens', authorName: 'test@gmail.com'},
        ],
        expectedOutput: [1521],
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
