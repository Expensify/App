import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest} from 'bun:test';

import * as core from '@actions/core';
import {RequestError as NestedRequestError} from '@actions/github/node_modules/@octokit/request-error';

import type {InternalOctokit} from '../../.github/libs/GithubUtils';

/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../.github/libs/CONST';
import GithubUtils from '../../.github/libs/GithubUtils';
import GitUtils from '../../.github/libs/GitUtils';

type ObjectMethodData<T> = {
    data: T;
};

type PullRequest = {
    issue_number: number;
    title: string;
    merged_by: {login: string};
    labels: Array<{name: string}>;
};

type PullRequestParams = {
    pull_number: number;
};

type PullRequestData = {
    data?: PullRequest;
};

type Commit = {
    commit_sha: string;
};

type CommitData = {
    data: {
        message: string;
    };
};

const mockGetInput = jest.fn();
const mockGetPullRequest = jest.fn();
const mockCreateComment = jest.fn();
const mockListTags = jest.fn();
const mockGetCommit = jest.fn();

// Must be set before `markPullRequestsAsDeployed` is imported below: it computes `workflowURL` from these env
// vars in a top-level (module-load-time) constant, not at runtime.
process.env.GITHUB_SERVER_URL = 'https://github.com';
process.env.GITHUB_RUN_ID = '1234';
const workflowRunURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

// Mock core module. Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't be
// reassigned directly (unlike Jest's Babel-transpiled CJS interop); spy on it instead.
jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);

// Must also be set before `markPullRequestsAsDeployed` is imported below: it does `memoize(GithubUtils.octokit.git.
// getCommit)` in a top-level (module-load-time) constant, capturing whatever `internalOctokit` points to at that
// moment rather than reading it fresh on each call.
const mockOctokit = {
    rest: {
        issues: {
            listForRepo: jest.fn().mockImplementation(async () => ({
                data: [
                    {
                        number: 5,
                    },
                ],
            })),

            listEvents: jest.fn().mockImplementation(async () => ({
                data: [{event: 'closed', actor: {login: 'thor'}}],
            })),
            createComment: mockCreateComment,
        },
        pulls: {
            get: mockGetPullRequest,
        },
        repos: {
            listTags: mockListTags,
        },
        git: {
            getCommit: mockGetCommit,
        },
    },
    paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the stub implements only the endpoints this action touches, and the load-order constraint above rules out initializing a real octokit and spying on it
GithubUtils.internalOctokit = mockOctokit as unknown as InternalOctokit;

// Must be imported after the GithubUtils.internalOctokit setup above so it picks up the mocks.
const {default: run} = await import('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');

const PRList: Record<number, PullRequest> = {
    1: {
        issue_number: 1,
        title: 'Test PR 1',
        merged_by: {
            login: 'odin',
        },
        labels: [],
    },
    2: {
        issue_number: 2,
        title: 'Test PR 2',
        merged_by: {
            login: 'loki',
        },
        labels: [],
    },
};
const version = '42.42.42-42';
const defaultTags = [
    {name: '42.42.42-42', commit: {sha: 'abcd'}},
    {name: '42.42.42-41', commit: {sha: 'hash'}},
];

// `core.getInput` always returns a string, so this returns strings too: the action's inputs go through the real
// ActionUtils.getJSONInput, which JSON.parses whatever it gets back.
function mockGetInputDefaultImplementation(key: string): string {
    switch (key) {
        case 'PR_LIST':
            return JSON.stringify(Object.keys(PRList));
        case 'IS_PRODUCTION_DEPLOY':
            return 'false';
        case 'DEPLOY_VERSION':
            return version;
        case 'IOS':
        case 'ANDROID':
        case 'WEB':
            return 'success';
        case 'DATE':
        case 'MOBILE_EXPENSIFY_PR_LIST':
        case 'NOTE':
        case 'ANDROID_SENTRY_URL':
        case 'IOS_SENTRY_URL':
            return '';
        default:
            throw new Error(`Trying to access invalid input: ${key}`);
    }
}

function mockGetCommitDefaultImplementation({commit_sha}: Commit): CommitData {
    if (commit_sha === 'abcd') {
        return {data: {message: 'Test commit 1'}};
    }
    return {data: {message: 'Test commit 2'}};
}

beforeAll(() => {
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);

    // Mock GitUtils
    GitUtils.getPullRequestsDeployedBetween = jest.fn();
});

beforeEach(() => {
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);
    mockGetPullRequest.mockImplementation(({pull_number}: PullRequestParams): PullRequestData => (pull_number in PRList ? {data: PRList[pull_number]} : {}));
    mockListTags.mockResolvedValue({
        data: defaultTags,
    });
    mockGetCommit.mockImplementation(mockGetCommitDefaultImplementation);
});

afterEach(() => {
    mockGetInput.mockClear();
    mockCreateComment.mockClear();
    mockGetPullRequest.mockClear();
    mockListTags.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('markPullRequestsAsDeployed', () => {
    it('comments on pull requests correctly for a standard staging deploy', async () => {
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
        for (let i = 0; i < Object.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|success ✅
🍎 iOS 🍎|success ✅`,
                issue_number: PR.issue_number,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
            });
        }
    });

    it('comments on pull requests correctly for a standard production deploy', async () => {
        mockGetInput.mockImplementation((key: string) => {
            if (key === 'IS_PRODUCTION_DEPLOY') {
                return 'true';
            }
            return mockGetInputDefaultImplementation(key);
        });

        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
        for (let i = 0; i < Object.keys(PRList).length; i++) {
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to production by https://github.com/thor in version: ${version} 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|success ✅
🍎 iOS 🍎|success ✅`,
                issue_number: PRList[i + 1].issue_number,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
            });
        }
    });

    it('comments on pull requests correctly for a cherry pick', async () => {
        mockGetInput.mockImplementation((key: string) => {
            if (key === 'PR_LIST') {
                return JSON.stringify([3]);
            }
            if (key === 'DEPLOY_VERSION') {
                return '42.42.42-43';
            }
            return mockGetInputDefaultImplementation(key);
        });
        mockGetPullRequest.mockImplementation(({pull_number}: PullRequestParams) => {
            if (pull_number === 3) {
                return {
                    data: {
                        issue_number: 3,
                        title: 'Test PR 3',
                        merged_by: {
                            login: 'thor',
                        },
                        labels: [{name: CONST.LABELS.CP_STAGING}],
                    },
                };
            }
            return {};
        });
        mockListTags.mockResolvedValue({
            data: [{name: '42.42.42-43', commit: {sha: 'xyz'}}, ...defaultTags],
        });
        mockGetCommit.mockImplementation(({commit_sha}: Commit) => {
            if (commit_sha === 'xyz') {
                return {
                    data: {
                        message: `Merge pull request #3 blahblahblah\\n(cherry picked from commit dag_dag)\\n(cherry-picked to staging by freyja)`,
                    },
                };
            }
            return mockGetCommitDefaultImplementation({commit_sha});
        });

        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledWith({
            body: `🚀 [Cherry-picked](${workflowRunURL}) to staging by https://github.com/freyja in version: 42.42.42-43 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|success ✅
🍎 iOS 🍎|success ✅`,
            issue_number: 3,
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
        });
    });

    it('comments on pull requests correctly when one platform fails', async () => {
        mockGetInput.mockImplementation((key: string) => {
            if (key === 'ANDROID') {
                return 'skipped';
            }
            if (key === 'IOS') {
                return 'failed';
            }
            return mockGetInputDefaultImplementation(key);
        });

        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
        for (let i = 0; i < Object.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|skipped 🚫
🍎 iOS 🍎|failed ❌`,
                issue_number: PR.issue_number,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
            });
        }
    });

    it.each([
        ['continues processing App pull requests when the optional Mobile-Expensify input is omitted', '', []],
        ['continues processing App pull requests when the optional Mobile-Expensify input is JSON null', 'null', []],
        ['continues processing App pull requests when the optional Mobile-Expensify input is a JSON object', '{"unexpected":true}', []],
        ['continues processing App pull requests when the optional Mobile-Expensify input is a JSON boolean', 'true', []],
        ['continues processing App pull requests when the optional Mobile-Expensify input is a JSON string', '"1"', []],
        ['continues processing App pull requests when the optional Mobile-Expensify input is a JSON number', '1', []],
        ['normalizes mixed string and number Mobile-Expensify pull requests in input order', '["2",1]', [2, 1]],
        ['rejects a Mobile-Expensify array containing an element other than a string or number', '["1",false]', undefined],
    ])('%s', async (_scenario, input, mobilePullRequests) => {
        mockGetInput.mockImplementation((key: string) => (key === 'MOBILE_EXPENSIFY_PR_LIST' ? input : mockGetInputDefaultImplementation(key)));
        if (!mobilePullRequests) {
            await expect(run()).rejects.toThrow('Deploy pull request list must be an array of strings or numbers');
            expect(mockListTags).not.toHaveBeenCalled();
            expect(mockCreateComment).not.toHaveBeenCalled();
            return;
        }
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length + mobilePullRequests.length);
        expect(mockListTags).toHaveBeenCalledTimes(mobilePullRequests.length > 0 ? 2 : 1);
        expect(mockListTags).toHaveBeenCalledWith(expect.objectContaining({repo: CONST.APP_REPO}));
        if (mobilePullRequests.length === 0) {
            expect(mockCreateComment).not.toHaveBeenCalledWith(expect.objectContaining({repo: CONST.MOBILE_EXPENSIFY_REPO}));
        }
        for (const [index, pullRequest] of mobilePullRequests.entries()) {
            expect(mockCreateComment).toHaveBeenNthCalledWith(index + 3, expect.objectContaining({issue_number: pullRequest, repo: CONST.MOBILE_EXPENSIFY_REPO}));
        }
    });

    it.each([
        ['logs and skips a 404 from the Octokit dependency used by GitHub Actions while processing the remaining pull requests', 404],
        ['rethrows a non-404 from the Octokit dependency used by GitHub Actions without changing its identity', 503],
    ])('%s', async (_scenario, status) => {
        const requestError = new NestedRequestError(status === 404 ? 'Not Found' : 'Service Unavailable', status, {
            request: {method: 'GET', url: 'https://api.github.com/repos/Expensify/App/pulls/1', headers: {}},
        });
        mockGetPullRequest.mockImplementation(({pull_number}: PullRequestParams): PullRequestData => {
            if (pull_number === 1) {
                throw requestError;
            }
            return {data: PRList[pull_number]};
        });
        if (status !== 404) {
            await expect(run()).rejects.toBe(requestError);
            return;
        }
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        try {
            await run();
            expect(consoleLogSpy).toHaveBeenCalledWith(`Unable to comment on ${CONST.APP_REPO} PR #1. GitHub responded with 404.`);
            expect(mockGetPullRequest).toHaveBeenCalledTimes(Object.keys(PRList).length);
            expect(mockCreateComment).toHaveBeenCalledTimes(1);
            expect(mockCreateComment).toHaveBeenCalledWith(expect.objectContaining({issue_number: 2}));
        } finally {
            consoleLogSpy.mockRestore();
        }
    });
});
