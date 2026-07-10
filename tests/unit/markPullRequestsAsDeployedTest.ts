import * as core from '@actions/core';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest, mock} from 'bun:test';

import type {InternalOctokit} from '../../.github/libs/GithubUtils';

/* eslint-disable @typescript-eslint/naming-convention */
import * as ActionUtils from '../../.github/libs/ActionUtils';
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

const mockGetJSONInput = jest.fn().mockImplementation((name: string, defaultValue: string) => {
    try {
        const input = mockGetInput(name) as string;
        return JSON.parse(input) as unknown;
    } catch (err) {
        return defaultValue;
    }
});

// Capture the real exports by value before mocking: `ActionUtils` is a live namespace binding tied to the shared
// module registry entry, so once mock.module() below replaces that entry, `ActionUtils` would itself resolve to
// the mocked exports too - which would make the afterAll restoration below a no-op that "restores" the mock
// forever instead of the real module.
const originalActionUtils = {...ActionUtils};

// Must run before `markPullRequestsAsDeployed` (which imports `ActionUtils` internally) is imported below:
// mock.module patches the shared module registry entry, and existing named-import bindings to it are live, but
// only if the patch happens before those bindings are first read.
await mock.module('../../.github/libs/ActionUtils', () => ({
    ...ActionUtils,
    getJSONInput: mockGetJSONInput,
}));

// Must also be set before `markPullRequestsAsDeployed` is imported below: it computes `workflowURL` from these env
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

function mockGetInputDefaultImplementation(key: string): boolean | string {
    switch (key) {
        case 'PR_LIST':
            return JSON.stringify(Object.keys(PRList));
        case 'IS_PRODUCTION_DEPLOY':
            return false;
        case 'DEPLOY_VERSION':
            return version;
        case 'IOS':
        case 'ANDROID':
        case 'WEB':
            return 'success';
        case 'DATE':
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

let originalGetPullRequestsDeployedBetween: typeof GitUtils.getPullRequestsDeployedBetween;

beforeAll(() => {
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);

    // Mock GitUtils
    originalGetPullRequestsDeployedBetween = GitUtils.getPullRequestsDeployedBetween;
    GitUtils.getPullRequestsDeployedBetween = jest.fn();
});

beforeEach(() => {
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
});

afterAll(async () => {
    jest.clearAllMocks();
    // `bun test` runs all files in one process sharing GithubUtils'/GitUtils' module-level state and the module
    // registry, unlike Jest's per-file module registry; reset them so later test files start from a clean slate.
    GithubUtils.internalOctokit = undefined;
    GitUtils.getPullRequestsDeployedBetween = originalGetPullRequestsDeployedBetween;
    await mock.module('../../.github/libs/ActionUtils', () => originalActionUtils);
    delete process.env.GITHUB_SERVER_URL;
    delete process.env.GITHUB_RUN_ID;
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
                return true;
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
});
