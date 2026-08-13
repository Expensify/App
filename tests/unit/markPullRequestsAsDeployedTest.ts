import type {InternalOctokit} from '../../.github/libs/GithubUtils';

/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../.github/libs/CONST';
import GithubUtils from '../../.github/libs/GithubUtils';
import GitUtils from '../../.github/libs/GitUtils';
import createMock from '../utils/createMock';

type GetPullRequest = InternalOctokit['rest']['pulls']['get'];
type GetPullRequestResponse = Awaited<ReturnType<GetPullRequest>>;
type PullRequest = GetPullRequestResponse['data'];
type ListTags = InternalOctokit['rest']['repos']['listTags'];
type ListTagsResponse = Awaited<ReturnType<ListTags>>;
type Tag = ListTagsResponse['data'][number];
type GetCommit = InternalOctokit['rest']['git']['getCommit'];
type GetCommitResponse = Awaited<ReturnType<GetCommit>>;
type Commit = GetCommitResponse['data'];
type CreateComment = InternalOctokit['rest']['issues']['createComment'];
type CreateCommentResponse = Awaited<ReturnType<CreateComment>>;

let run: () => Promise<void>;

const mockGetInput = jest.fn();
const mockGetPullRequest = jest.fn<ReturnType<GetPullRequest>, Parameters<GetPullRequest>>();
const mockCreateComment = jest.fn<ReturnType<CreateComment>, Parameters<CreateComment>>();
const mockListTags = jest.fn<ReturnType<ListTags>, Parameters<ListTags>>();
const mockGetCommit = jest.fn<ReturnType<GetCommit>, Parameters<GetCommit>>();

let workflowRunURL: string | null;

const PRList: Record<number, PullRequest> = {
    1: createMock<PullRequest>({
        number: 1,
        title: 'Test PR 1',
        merged_by: {
            login: 'odin',
        },
        labels: [],
    }),
    2: createMock<PullRequest>({
        number: 2,
        title: 'Test PR 2',
        merged_by: {
            login: 'loki',
        },
        labels: [],
    }),
};
const version = '42.42.42-42';
const defaultTags: ListTagsResponse['data'] = [createMock<Tag>({name: '42.42.42-42', commit: {sha: 'abcd'}}), createMock<Tag>({name: '42.42.42-41', commit: {sha: 'hash'}})];

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

async function mockGetCommitDefaultImplementation(...[params]: Parameters<GetCommit>): ReturnType<GetCommit> {
    if (!params) {
        throw new Error('Commit parameters are required.');
    }
    const {commit_sha} = params;
    if (commit_sha === 'abcd') {
        return {data: createMock<Commit>({message: 'Test commit 1'}), headers: {}, status: 200, url: ''};
    }
    return {data: createMock<Commit>({message: 'Test commit 2'}), headers: {}, status: 200, url: ''};
}

beforeAll(() => {
    // Mock core module
    jest.mock('@actions/core', () => ({
        getInput: mockGetInput,
    }));
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);

    // Mock octokit module
    GithubUtils.initOctokitWithToken('fake_token');
    const initializedOctokit = GithubUtils.internalOctokit;
    if (!initializedOctokit) {
        throw new Error('GithubUtils failed to initialize Octokit.');
    }
    jest.spyOn(initializedOctokit.rest.issues, 'listForRepo').mockResolvedValue(
        createMock<Awaited<ReturnType<InternalOctokit['rest']['issues']['listForRepo']>>>({
            data: [{number: 5}],
            headers: {},
        }),
    );
    const listEventsEndpoint = initializedOctokit.rest.issues.listEvents.endpoint;
    const listEventsDefaults = initializedOctokit.rest.issues.listEvents.defaults;
    jest.spyOn(initializedOctokit.rest.issues, 'listEvents').mockResolvedValue(
        createMock<Awaited<ReturnType<InternalOctokit['rest']['issues']['listEvents']>>>({
            data: [{event: 'closed', actor: {login: 'thor'}}],
            headers: {},
        }),
    );
    const mockListEvents = jest.mocked(initializedOctokit.rest.issues.listEvents, {shallow: true});
    mockListEvents.endpoint = listEventsEndpoint;
    mockListEvents.defaults = listEventsDefaults;
    jest.spyOn(initializedOctokit.rest.issues, 'createComment').mockImplementation((...args) => mockCreateComment(...args));
    jest.spyOn(initializedOctokit.rest.pulls, 'get').mockImplementation((...args) => mockGetPullRequest(...args));
    jest.spyOn(initializedOctokit.rest.repos, 'listTags').mockImplementation((...args) => mockListTags(...args));
    jest.spyOn(initializedOctokit.rest.git, 'getCommit').mockImplementation((...args) => mockGetCommit(...args));

    // Mock GitUtils
    GitUtils.getPullRequestsDeployedBetween = jest.fn();

    jest.mock('../../.github/libs/ActionUtils', () => ({
        getJSONInput: jest.fn().mockImplementation((name: string, defaultValue: string) => {
            try {
                const input = String(mockGetInput(name));
                return JSON.parse(input) as unknown;
            } catch (err) {
                return defaultValue;
            }
        }),
    }));

    // Set GH runner environment variables
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_RUN_ID = '1234';
    workflowRunURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
});

beforeEach(() => {
    mockGetPullRequest.mockImplementation(async (params) => {
        if (!params) {
            throw new Error('Pull request parameters are required.');
        }
        const pullRequest = PRList[params.pull_number];
        if (!pullRequest) {
            throw new Error(`Unexpected pull request: ${params.pull_number}`);
        }
        return {data: pullRequest, headers: {}, status: 200, url: ''};
    });
    mockCreateComment.mockResolvedValue({data: createMock<CreateCommentResponse['data']>({}), headers: {}, status: 201, url: ''});
    mockListTags.mockResolvedValue({data: defaultTags, headers: {}, status: 200, url: ''});
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

type MockedActionRun = () => Promise<void>;

describe('markPullRequestsAsDeployed', () => {
    it('comments on pull requests correctly for a standard staging deploy', async () => {
        // Note: we import this in here so that it executes after all the mocks are set up
        run = require<MockedActionRun>('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
        for (let i = 0; i < Object.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            if (!PR.merged_by) {
                throw new Error(`Pull request ${PR.number} has no merger.`);
            }
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|success ✅
🍎 iOS 🍎|success ✅`,
                issue_number: PR.number,
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

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require<MockedActionRun>('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');

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
                issue_number: PRList[i + 1].number,
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
        mockGetPullRequest.mockImplementation(async (params) => {
            if (!params) {
                throw new Error('Pull request parameters are required.');
            }
            const {pull_number} = params;
            if (pull_number === 3) {
                return {
                    data: createMock<PullRequest>({
                        number: 3,
                        title: 'Test PR 3',
                        merged_by: {
                            login: 'thor',
                        },
                        labels: [{name: CONST.LABELS.CP_STAGING}],
                    }),
                    headers: {},
                    status: 200,
                    url: '',
                };
            }
            throw new Error(`Unexpected pull request: ${pull_number}`);
        });
        mockListTags.mockResolvedValue({
            data: [createMock<Tag>({name: '42.42.42-43', commit: {sha: 'xyz'}}), ...defaultTags],
            headers: {},
            status: 200,
            url: '',
        });
        mockGetCommit.mockImplementation(async (...args) => {
            const [params] = args;
            if (!params) {
                throw new Error('Commit parameters are required.');
            }
            const {commit_sha} = params;
            if (commit_sha === 'xyz') {
                return {
                    data: createMock<Commit>({
                        message: `Merge pull request #3 blahblahblah\\n(cherry picked from commit dag_dag)\\n(cherry-picked to staging by freyja)`,
                    }),
                    headers: {},
                    status: 200,
                    url: '',
                };
            }
            return mockGetCommitDefaultImplementation(...args);
        });

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require<MockedActionRun>('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
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

        // Note: we import this in here so that it executes after all the mocks are set up
        run = require<MockedActionRun>('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
        await run();
        expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
        for (let i = 0; i < Object.keys(PRList).length; i++) {
            const PR = PRList[i + 1];
            if (!PR.merged_by) {
                throw new Error(`Pull request ${PR.number} has no merger.`);
            }
            expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                body: `🚀 [Deployed](${workflowRunURL}) to staging by https://github.com/${PR.merged_by.login} in version: ${version} 🚀

platform | result
---|---
🕸 web 🕸|success ✅
🤖 android 🤖|skipped 🚫
🍎 iOS 🍎|failed ❌`,
                issue_number: PR.number,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
            });
        }
    });
});
