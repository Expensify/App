/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '@github/actions/javascript/checkDeployBlockers/checkDeployBlockers';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import asMutable from '@src/types/utils/asMutable';

type CommentData = {body: string};

type Comment = {data?: CommentData[]};

type PullRequest = {url: string; isQASuccess: boolean};

// Static mock function for core.getInput
const mockGetInput = jest.fn().mockImplementation((arg: string): string | number | undefined => {
    if (arg === 'GITHUB_TOKEN') {
        return 'fake_token';
    }

    if (arg === 'ISSUE_NUMBER') {
        return 1;
    }
});

const mockSetOutput = jest.fn();
const mockGetIssue = jest.fn();
const mockListComments = jest.fn();

beforeAll(() => {
    // Mock core module
    asMutable(core).getInput = mockGetInput;
    asMutable(core).setOutput = mockSetOutput;

    // Mock octokit module
    const moctokit = {
        rest: {
            issues: {
                get: mockGetIssue,
                listComments: mockListComments,
            },
        },
    } as unknown as InternalOctokit;

    GithubUtils.internalOctokit = moctokit;
});

let baseComments: Comment = {};
beforeEach(() => {
    baseComments = {
        data: [
            {
                body: 'foo',
            },
            {
                body: 'bar',
            },
            {
                body: ':shipit:',
            },
        ],
    };
});

afterEach(() => {
    mockSetOutput.mockClear();
    mockGetIssue.mockClear();
    mockListComments.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

function checkbox(isClosed: boolean): string {
    return isClosed ? '[x]' : '[ ]';
}

function mockIssue(prList: PullRequest[], deployBlockerList?: PullRequest[]) {
    return {
        data: {
            number: 1,
            title: "Scott's QA Checklist",
            body: `
**Release Version:** \`1.1.31-2\`
**Compare Changes:** https://github.com/Expensify/App/compare/production...staging

**This release contains changes from the following pull requests:**
${prList
    .map(
        ({url, isQASuccess}) => `
- ${checkbox(isQASuccess)} ${url}
`,
    )
    .join('\n')}
${
    !deployBlockerList || deployBlockerList.length < 0
        ? `

**Deploy Blockers:**`
        : ''
}
${deployBlockerList
    ?.map(
        ({url, isQASuccess}) => `
- ${checkbox(isQASuccess)} ${url}
`,
    )
    .join('\n')}
cc @Expensify/applauseleads
`,
        },
    };
}

describe('checkDeployBlockers', () => {
    const allClearIssue = mockIssue([{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true}]);

    describe('checkDeployBlockers', () => {
        test('Test an issue with all checked items and :shipit:', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
        });

        test('Test an issue with all boxes checked but no :shipit:', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            const extraComments = {
                data: [...(baseComments?.data ?? []), {body: 'This issue either has unchecked QA steps or has not yet been stamped with a :shipit: comment. Reopening!'}],
            };
            mockListComments.mockResolvedValue(extraComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all boxes checked but no comments', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue({data: []});
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all QA checked but not all deploy blockers', async () => {
            mockGetIssue.mockResolvedValue(
                mockIssue([{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true}], [{url: 'https://github.com/Expensify/App/pull/6883', isQASuccess: false}]),
            );
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all QA checked and all deploy blockers resolved', async () => {
            mockGetIssue.mockResolvedValue(
                mockIssue([{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true}], [{url: 'https://github.com/Expensify/App/pull/6883', isQASuccess: true}]),
            );
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
        });
    });
});
