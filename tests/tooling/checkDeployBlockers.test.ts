import type {Mock} from 'bun:test';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

import run from '@github/actions/javascript/checkDeployBlockers/checkDeployBlockers';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

import * as core from '@actions/core';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

type GetIssueMethod = InternalOctokit['rest']['issues']['get'];
type ListCommentsMethod = InternalOctokit['rest']['issues']['listComments'];
type GetIssueResponse = Awaited<ReturnType<GetIssueMethod>>;
type ListCommentsResponse = Awaited<ReturnType<ListCommentsMethod>>;

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
let mockGetIssue: Mock<GetIssueMethod>;
let mockListComments: Mock<ListCommentsMethod>;

beforeAll(() => {
    // Mock core module. Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't be
    // reassigned directly (unlike Jest's Babel-transpiled CJS interop); spy on it instead.
    jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
    jest.spyOn(core, 'setOutput').mockImplementation(mockSetOutput);

    GithubUtils.initOctokitWithToken('fake_token');
    if (!GithubUtils.internalOctokit) {
        throw new Error('Expected GitHubUtils to initialize Octokit');
    }
    GithubUtils.internalOctokit.rest.issues = materializeOctokitNamespace(GithubUtils.internalOctokit.rest.issues);
    mockGetIssue = jest.spyOn(GithubUtils.internalOctokit.rest.issues, 'get');
    mockListComments = jest.spyOn(GithubUtils.internalOctokit.rest.issues, 'listComments');
});

let baseComments: ListCommentsResponse;
beforeEach(() => {
    baseComments = createMock<ListCommentsResponse>({
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
    });
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

function mockIssue(prList: PullRequest[], deployBlockerList?: PullRequest[]): GetIssueResponse {
    return createMock<GetIssueResponse>({
        data: {
            number: 1,
            title: "Scott's QA Checklist",
            body: `
**Release Version:** \`1.1.31-2\`
**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging

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
    });
}

describe('checkDeployBlockers', () => {
    const allClearIssue = mockIssue([{url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6882`, isQASuccess: true}]);

    describe('checkDeployBlockers', () => {
        test('Test an issue with all checked items and :shipit:', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
        });

        test('Test an issue with all boxes checked but no :shipit:', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            const extraComments = createMock<ListCommentsResponse>({
                data: [...(baseComments?.data ?? []), {body: 'This issue either has unchecked QA steps or has not yet been stamped with a :shipit: comment. Reopening!'}],
            });
            mockListComments.mockResolvedValue(extraComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all boxes checked but no comments', async () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue(createMock<ListCommentsResponse>({data: []}));
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all QA checked but not all deploy blockers', async () => {
            mockGetIssue.mockResolvedValue(
                mockIssue(
                    [{url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6882`, isQASuccess: true}],
                    [{url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6883`, isQASuccess: false}],
                ),
            );
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
        });

        test('Test an issue with all QA checked and all deploy blockers resolved', async () => {
            mockGetIssue.mockResolvedValue(
                mockIssue(
                    [{url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6882`, isQASuccess: true}],
                    [{url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6883`, isQASuccess: true}],
                ),
            );
            mockListComments.mockResolvedValue(baseComments);
            await expect(run()).resolves.toBeUndefined();
            expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
        });
    });
});
