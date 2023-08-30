/**
 * @jest-environment node
 */
const _ = require('underscore');
const GitUtils = require('../../.github/libs/GitUtils');
const GithubUtils = require('../../.github/libs/GithubUtils');

let run;

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();
const mockListEvents = jest.fn();
const mockCreateComment = jest.fn();
const mockGetPullRequestsMergedBetween = jest.fn();
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

/**
 * @param {String} key
 * @returns {Boolean|String}
 * @throws {Error}
 */
function defaultMockGetInput(key) {
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
 * @returns {Promise<[{actor: {login: string}, event: string}]>}
 */
async function defaultMockListEvents() {
    return {data: [{event: 'closed', actor: {login: 'thor'}}]};
}

beforeAll(() => {
    // Mock core module
    jest.mock('@actions/core', () => ({
        getInput: mockGetInput,
    }));
    mockGetInput.mockImplementation(defaultMockGetInput);

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
                listEvents: mockListEvents,
                createComment: mockCreateComment,
            },
            pulls: {
                // Static mock for pulls.list (only used to filter out automated PRs, and that functionality is covered
                // in the test for GithubUtils.generateStagingDeployCashBody
                list: jest.fn().mockResolvedValue([]),
                get: jest.fn().mockImplementation(async ({pull_number}) => (pull_number in PRList ? {data: PRList[pull_number]} : {})),
            },
            repos: {
                listTags: jest.fn().mockResolvedValue({
                    data: [
                        {name: '42.42.42-42', commit: {sha: 'abcd'}},
                        {name: '42.42.42-41', commit: {sha: 'efgh'}},
                    ],
                }),
            },
            git: {
                getCommit: jest.fn().mockImplementation(async (sha) => {
                    if (sha === 'abcd') {
                        return {data: {message: 'Test commit 1'}};
                    }
                    return {data: {message: 'Test commit 2'}};
                }),
            },
        },
        paginate: jest.fn().mockImplementation((objectMethod) => objectMethod().then(({data}) => data)),
    };
    GithubUtils.internalOctokit = moctokit;
    mockListEvents.mockImplementation(defaultMockListEvents);

    // Mock GitUtils
    GitUtils.getPullRequestsMergedBetween = mockGetPullRequestsMergedBetween;

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

beforeEach(() => {});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetPullRequestsMergedBetween.mockClear();
    mockCreateComment.mockClear();
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
            return defaultMockGetInput(key);
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

    it('comments on pull requests correctly for a cherry pick', async () => {});

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
            return defaultMockGetInput(key);
        });

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
    });
});
