/**
 * @jest-environment node
 */
const _ = require('underscore');
const GitUtils = require('../../.github/libs/GitUtils');
const GithubUtils = require('../../.github/libs/GithubUtils');

let run;

const mockGetInput = jest.fn();
const mockGetPullRequest = jest.fn();
const mockCreateComment = jest.fn();
const mockListTags = jest.fn();
const mockGetCommit = jest.fn();
let workflowRunURL;
const PRList = {
    1: {
        issue_number: 1,
        title: 'Test PR 1',
        merged_by: {
            login: 'odin',
        },
    },
    2: {
        issue_number: 2,
        title: 'Test PR 2',
        merged_by: {
            login: 'loki',
        },
    },
};
const version = '42.42.42-42';
const defaultTags = [
    {name: '42.42.42-42', commit: {sha: 'abcd'}},
    {name: '42.42.42-41', commit: {sha: 'efgh'}},
];

/**
 * @param {String} key
 * @returns {Boolean|String}
 * @throws {Error}
 */
function mockGetInputDefaultImplementation(key) {
    switch (key) {
        case 'PR_LIST':
            return JSON.stringify(_.keys(PRList));
        case 'IS_PRODUCTION_DEPLOY':
            return false;
        case 'DEPLOY_VERSION':
            return version;
        case 'IOS':
        case 'ANDROID':
        case 'DESKTOP':
        case 'WEB':
            return 'success';
        default:
            throw new Error('Trying to access invalid input');
    }
}

/**
 * @param {String} sha
 * @returns {Promise<{data: {message: String}}>}
 */
async function mockGetCommitDefaultImplementation({commit_sha}) {
    if (commit_sha === 'abcd') {
        return {data: {message: 'Test commit 1'}};
    }
    return {data: {message: 'Test commit 2'}};
}

beforeAll(() => {
    // Mock core module
    jest.mock('@actions/core', () => ({
        getInput: mockGetInput,
    }));
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);

    // Mock octokit module
    const moctokit = {
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
        paginate: jest.fn().mockImplementation((objectMethod) => objectMethod().then(({data}) => data)),
    };
    GithubUtils.internalOctokit = moctokit;

    // Mock GitUtils
    GitUtils.getPullRequestsMergedBetween = jest.fn();

    jest.mock('../../.github/libs/ActionUtils', () => ({
        getJSONInput: jest.fn().mockImplementation((name, defaultValue) => {
            try {
                const input = mockGetInput(name);
                return JSON.parse(input);
            } catch (err) {
                return defaultValue;
            }
        }),
    }));

    // Set GH runner environment variables
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
    process.env.GITHUB_RUN_ID = 1234;
    workflowRunURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
});

beforeEach(() => {
    mockGetPullRequest.mockImplementation(async ({pull_number}) => (pull_number in PRList ? {data: PRList[pull_number]} : {}));
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

afterAll(() => {
    jest.clearAllMocks();
});

describe('markPullRequestsAsDeployed', () => {
    it('comments on pull requests correctly for a standard staging deploy', async () => {
        // Note: we import this in here so that it executes after all the mocks are set up
        run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(_.keys(PRList).length);
        for (let i = 0; i < _.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🤖 android 🤖|success ✅
🖥 desktop 🖥|success ✅
🍎 iOS 🍎|success ✅
🕸 web 🕸|success ✅`,
                issue_number: PR.issue_number,
                owner: 'Expensify',
                repo: 'App',
            });
        }
    });

    it('comments on pull requests correctly for a standard production deploy', async () => {
        mockGetInput.mockImplementation((key) => {
            if (key === 'IS_PRODUCTION_DEPLOY') {
                return true;
            }
            return mockGetInputDefaultImplementation(key);
        });

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');

        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(_.keys(PRList).length);
        for (let i = 0; i < _.keys(PRList).length; i++) {
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to production by https://github.com/thor in version: ${version} 🚀

platform | result
---|---
🤖 android 🤖|success ✅
🖥 desktop 🖥|success ✅
🍎 iOS 🍎|success ✅
🕸 web 🕸|success ✅`,
                issue_number: PRList[i + 1].issue_number,
                owner: 'Expensify',
                repo: 'App',
            });
        }
    });

    it('comments on pull requests correctly for a cherry pick', async () => {
        mockGetInput.mockImplementation((key) => {
            if (key === 'PR_LIST') {
                return JSON.stringify([3]);
            }
            if (key === 'DEPLOY_VERSION') {
                return '42.42.42-43';
            }
            return mockGetInputDefaultImplementation(key);
        });
        mockGetPullRequest.mockImplementation(async ({pull_number}) => {
            if (pull_number === 3) {
                return {
                    data: {
                        issue_number: 3,
                        title: 'Test PR 3',
                        merged_by: {
                            login: 'thor',
                        },
                    },
                };
            }
            return {};
        });
        mockListTags.mockResolvedValue({
            data: [{name: '42.42.42-43', commit: {sha: 'xyz'}}, ...defaultTags],
        });
        mockGetCommit.mockImplementation(async ({commit_sha}) => {
            if (commit_sha === 'xyz') {
                return {data: {message: 'Test PR 3 (cherry picked from commit dagdag)', committer: {name: 'freyja'}}};
            }
            return mockGetCommitDefaultImplementation(commit_sha);
        });

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledWith({
            body: `🚀 [Cherry-picked](${workflowRunURL}) to staging by https://github.com/freyja in version: 42.42.42-43 🚀

platform | result
---|---
🤖 android 🤖|success ✅
🖥 desktop 🖥|success ✅
🍎 iOS 🍎|success ✅
🕸 web 🕸|success ✅

@Expensify/applauseleads please QA this PR and check it off on the [deploy checklist](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) if it passes.`,
            issue_number: 3,
            owner: 'Expensify',
            repo: 'App',
        });
    });

    it('comments on pull requests correctly when one platform fails', async () => {
        mockGetInput.mockImplementation((key) => {
            if (key === 'ANDROID') {
                return 'skipped';
            }
            if (key === 'IOS') {
                return 'failed';
            }
            if (key === 'DESKTOP') {
                return 'cancelled';
            }
            return mockGetInputDefaultImplementation(key);
        });

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(_.keys(PRList).length);
        for (let i = 0; i < _.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🤖 android 🤖|skipped 🚫
🖥 desktop 🖥|cancelled 🔪
🍎 iOS 🍎|failed ❌
🕸 web 🕸|success ✅`,
                issue_number: PR.issue_number,
                owner: 'Expensify',
                repo: 'App',
            });
        }
    });
});
