import type {CommitType, MergedPR, SubmoduleUpdate} from '../../.github/libs/GitUtils';
import GitUtils from '../../.github/libs/GitUtils';

type ExampleDataType = {
    input: CommitType[];
    expectedOutput: MergedPR[];
};

const data: ExampleDataType[] = [
    {
        input: [],
        expectedOutput: [],
    },
    {
        input: [{commit: '1', subject: 'Some random commit message', authorName: 'test@gmail.com', date: '2024-01-01T00:00:00Z'}],
        expectedOutput: [],
    },
    {
        input: [
            {commit: '1', subject: 'Start adding StagingDeployCash logic', authorName: 'test@gmail.com', date: '2024-01-01T00:00:00Z'},
            {commit: '2', subject: 'Setting up bones', authorName: 'test@gmail.com', date: '2024-01-01T01:00:00Z'},
            {commit: '3', subject: 'Merge pull request #337 from Expensify/francoisUpdateQbdSyncManager', authorName: 'test@gmail.com', date: '2024-01-01T02:00:00Z'},
            {commit: '4', subject: 'Merge pull request #336 from Expensify/andrew-pr-cla', authorName: 'test@gmail.com', date: '2024-01-01T03:00:00Z'},
            {commit: '5', subject: 'Update QBD Sync Manager version', authorName: 'test@gmail.com', date: '2024-01-01T04:00:00Z'},
            {commit: '6', subject: 'Only run CLA on PR comments or events', authorName: 'test@gmail.com', date: '2024-01-01T05:00:00Z'},
            {commit: '7', subject: 'Merge pull request #331 from Expensify/marcaaron-killMoment', authorName: 'test@gmail.com', date: '2024-01-01T06:00:00Z'},
            {commit: '8', subject: 'Merge pull request #330 from Expensify/andrew-cla-update', authorName: 'test@gmail.com', date: '2024-01-01T07:00:00Z'},
            {commit: '9', subject: 'Merge pull request #333 from Expensify/Rory-AddOnOffSwitchTooltip', authorName: 'test@gmail.com', date: '2024-01-01T08:00:00Z'},
            {commit: '10', subject: 'Setup OnOffSwitch component with tooltips', authorName: 'test@gmail.com', date: '2024-01-01T09:00:00Z'},
            {commit: '11', subject: 'Merge pull request #332 from Expensify/alex-mechler-patch-1', authorName: 'test@gmail.com', date: '2024-01-01T10:00:00Z'},
            {commit: '12', subject: 'Return to old hash-based deploy instructions', authorName: 'test@gmail.com', date: '2024-01-01T11:00:00Z'},
            {commit: '12', subject: 'Remove DEFAULT_START_DATE & DEFAULT_END_DATE altogether', authorName: 'test@gmail.com', date: '2024-01-01T12:00:00Z'},
        ],
        expectedOutput: [
            {prNumber: 337, date: '2024-01-01T02:00:00Z'},
            {prNumber: 336, date: '2024-01-01T03:00:00Z'},
            {prNumber: 331, date: '2024-01-01T06:00:00Z'},
            {prNumber: 330, date: '2024-01-01T07:00:00Z'},
            {prNumber: 333, date: '2024-01-01T08:00:00Z'},
            {prNumber: 332, date: '2024-01-01T10:00:00Z'},
        ],
    },
    {
        input: [
            {commit: '1', subject: 'Merge pull request #1521 from parasharrajat/parasharrajat/pdf-render', authorName: 'test@gmail.com', date: '2024-01-01T00:00:00Z'},
            {commit: '3', subject: 'Update version to 1.0.1-470', authorName: 'test@gmail.com', date: '2024-01-01T01:00:00Z'},
            {commit: '4', subject: '[IS-1500] Updated textAlignInput utility', authorName: 'test@gmail.com', date: '2024-01-01T02:00:00Z'},
            {commit: '5', subject: 'fix: set pdf width on large screens', authorName: 'test@gmail.com', date: '2024-01-01T03:00:00Z'},
        ],
        expectedOutput: [{prNumber: 1521, date: '2024-01-01T00:00:00Z'}],
    },
];

type SubmoduleExampleDataType = {
    name: string;
    input: CommitType[];
    expectedOutput: SubmoduleUpdate[];
};

const submoduleData: SubmoduleExampleDataType[] = [
    {
        name: 'returns empty array for empty input',
        input: [],
        expectedOutput: [],
    },
    {
        name: 'returns empty array when no submodule updates exist',
        input: [
            {commit: '1', subject: 'Merge pull request #100 from Expensify/someBranch', authorName: 'test@gmail.com', date: '2024-01-01T00:00:00Z'},
            {commit: '2', subject: 'Some random commit message', authorName: 'test@gmail.com', date: '2024-01-02T00:00:00Z'},
        ],
        expectedOutput: [],
    },
    {
        name: 'extracts version-based submodule update',
        input: [{commit: 'abc123', subject: 'Update Mobile-Expensify submodule version to 9.3.21-0', authorName: 'OSBotify', date: '2024-01-01T00:00:00Z'}],
        expectedOutput: [{version: '9.3.21-0', date: '2024-01-01T00:00:00Z', commit: 'abc123'}],
    },
    {
        name: 'extracts hash-based submodule update',
        input: [{commit: 'def456', subject: 'Update Mobile-Expensify submodule to 9f18fca', authorName: 'OSBotify', date: '2024-01-02T00:00:00Z'}],
        expectedOutput: [{version: '9f18fca', date: '2024-01-02T00:00:00Z', commit: 'def456'}],
    },
    {
        name: 'extracts both version-based and hash-based updates from mixed commits',
        input: [
            {commit: '1', subject: 'Merge pull request #100 from Expensify/someBranch', authorName: 'test@gmail.com', date: '2024-01-01T00:00:00Z'},
            {commit: 'abc123', subject: 'Update Mobile-Expensify submodule version to 9.3.21-0', authorName: 'OSBotify', date: '2024-01-02T00:00:00Z'},
            {commit: '2', subject: 'Merge pull request #101 from Expensify/anotherBranch', authorName: 'test@gmail.com', date: '2024-01-03T00:00:00Z'},
            {commit: 'def456', subject: 'Update Mobile-Expensify submodule to 9f18fca', authorName: 'OSBotify', date: '2024-01-04T00:00:00Z'},
            {commit: '3', subject: 'Some random commit message', authorName: 'test@gmail.com', date: '2024-01-05T00:00:00Z'},
        ],
        expectedOutput: [
            {version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc123'},
            {version: '9f18fca', date: '2024-01-04T00:00:00Z', commit: 'def456'},
        ],
    },
];

describe('GitUtils', () => {
    describe.each(data)('getValidMergedPRs', (exampleCase) => {
        test('getValidMergedPRs', () => {
            const result = GitUtils.getValidMergedPRs(exampleCase.input);
            expect(result).toStrictEqual(exampleCase.expectedOutput);
        });
    });

    describe.each(submoduleData)('getSubmoduleUpdates', (exampleCase) => {
        test(exampleCase.name, () => {
            const result = GitUtils.getSubmoduleUpdates(exampleCase.input);
            expect(result).toStrictEqual(exampleCase.expectedOutput);
        });
    });
});
