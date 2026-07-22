import {generateDeployChecklistBodyAndAssignees, getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';

import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';

/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention */
import {RequestError} from '@octokit/request-error';

type OctokitIssue = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][number];
type ListForRepoResponse = RestEndpointMethodTypes['issues']['listForRepo']['response'];
type OctokitListForRepo = (params?: RestEndpointMethodTypes['issues']['listForRepo']['parameters']) => Promise<ListForRepoResponse>;
type OctokitListPulls = (params?: RestEndpointMethodTypes['pulls']['list']['parameters']) => Promise<RestEndpointMethodTypes['pulls']['list']['response']>;
type OctokitGetPull = (params?: RestEndpointMethodTypes['pulls']['get']['parameters']) => Promise<RestEndpointMethodTypes['pulls']['get']['response']>;
type PullRequestSimple = RestEndpointMethodTypes['pulls']['list']['response']['data'][number];
type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data'];
type PullRequestFixture = PullRequestSimple & PullRequest;
type PullRequestRepository = PullRequestSimple['head']['repo'] & NonNullable<PullRequest['head']['repo']>;
type PullRequestHead = PullRequestSimple['head'] & PullRequest['head'];
type PullRequestBase = PullRequestSimple['base'] & PullRequest['base'];

const pullRequestUser: NonNullable<PullRequestSimple['user']> = {
    login: 'octocat',
    id: 1,
    node_id: '',
    avatar_url: '',
    gravatar_id: null,
    url: '',
    html_url: '',
    followers_url: '',
    following_url: '',
    gists_url: '',
    starred_url: '',
    subscriptions_url: '',
    organizations_url: '',
    repos_url: '',
    events_url: '',
    received_events_url: '',
    type: 'User',
    site_admin: false,
};

const pullRequestRepository: PullRequestRepository = {
    id: 1,
    node_id: '',
    name: 'Expensify',
    full_name: 'Expensify/Expensify',
    license: null,
    forks: 0,
    owner: pullRequestUser,
    private: false,
    html_url: '',
    description: null,
    fork: false,
    url: '',
    archive_url: '',
    assignees_url: '',
    blobs_url: '',
    branches_url: '',
    collaborators_url: '',
    comments_url: '',
    commits_url: '',
    compare_url: '',
    contents_url: '',
    contributors_url: '',
    deployments_url: '',
    downloads_url: '',
    events_url: '',
    forks_url: '',
    git_commits_url: '',
    git_refs_url: '',
    git_tags_url: '',
    git_url: '',
    hooks_url: '',
    issue_comment_url: '',
    issue_events_url: '',
    issues_url: '',
    keys_url: '',
    labels_url: '',
    languages_url: '',
    merges_url: '',
    milestones_url: '',
    notifications_url: '',
    pulls_url: '',
    releases_url: '',
    ssh_url: '',
    stargazers_url: '',
    statuses_url: '',
    subscribers_url: '',
    subscription_url: '',
    tags_url: '',
    teams_url: '',
    trees_url: '',
    clone_url: '',
    default_branch: 'main',
    forks_count: 0,
    open_issues: 0,
    open_issues_count: 0,
    has_downloads: true,
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: true,
    homepage: null,
    language: null,
    archived: false,
    disabled: false,
    mirror_url: null,
    pushed_at: '',
    size: 0,
    stargazers_count: 0,
    svn_url: '',
    watchers: 0,
    watchers_count: 0,
    created_at: '',
    updated_at: '',
};

const pullRequestHead: PullRequestHead = {
    label: 'Expensify:main',
    ref: 'main',
    repo: pullRequestRepository,
    sha: '',
    user: pullRequestUser,
};

const pullRequestBase: PullRequestBase = {
    label: 'Expensify:main',
    ref: 'main',
    repo: pullRequestRepository,
    sha: '',
    user: pullRequestUser,
};

const pullRequestLinks: PullRequestSimple['_links'] & PullRequest['_links'] = {
    comments: {href: ''},
    commits: {href: ''},
    statuses: {href: ''},
    html: {href: ''},
    issue: {href: ''},
    review_comments: {href: ''},
    review_comment: {href: ''},
    self: {href: ''},
};

const defaultPullRequest: PullRequestFixture = {
    url: '',
    id: 0,
    node_id: '',
    html_url: '',
    diff_url: '',
    patch_url: '',
    issue_url: '',
    commits_url: '',
    review_comments_url: '',
    review_comment_url: '',
    comments_url: '',
    statuses_url: '',
    number: 0,
    state: 'open',
    locked: false,
    title: '',
    user: pullRequestUser,
    body: null,
    labels: [],
    milestone: null,
    created_at: '',
    updated_at: '',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    head: pullRequestHead,
    base: pullRequestBase,
    _links: pullRequestLinks,
    author_association: 'NONE',
    auto_merge: null,
    merged: false,
    mergeable: null,
    rebaseable: null,
    mergeable_state: 'unknown',
    merged_by: null,
    comments: 0,
    review_comments: 0,
    maintainer_can_modify: false,
    commits: 0,
    additions: 0,
    deletions: 0,
    changed_files: 0,
};

const createPullRequest = (overrides: Partial<PullRequestFixture>): PullRequestFixture => ({...defaultPullRequest, ...overrides});

const createListPullsResponse = (data: PullRequestSimple[]): RestEndpointMethodTypes['pulls']['list']['response'] => ({
    data,
    headers: {},
    status: 200,
    url: 'https://api.github.com/repos/Expensify/Expensify/pulls',
});

const createGetPullResponse = (data: PullRequest): RestEndpointMethodTypes['pulls']['get']['response'] => ({
    data,
    headers: {},
    status: 200,
    url: 'https://api.github.com/repos/Expensify/Expensify/pulls/1',
});

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const defaultIssue: OctokitIssue = {
    id: 0,
    node_id: '',
    url: '',
    repository_url: '',
    labels_url: '',
    comments_url: '',
    events_url: '',
    html_url: '',
    number: 0,
    state: 'open',
    title: '',
    body: null,
    user: null,
    labels: [],
    assignee: null,
    assignees: [],
    milestone: null,
    locked: false,
    comments: 0,
    closed_at: null,
    created_at: '',
    updated_at: '',
    author_association: 'NONE',
};

const createIssue = (overrides: Partial<OctokitIssue>): OctokitIssue => ({...defaultIssue, ...overrides});

const createListForRepoResponse = (data: OctokitIssue[]): ListForRepoResponse => ({
    data,
    headers: {},
    status: 200,
    url: 'https://api.github.com/repos/Expensify/Expensify/issues',
});

const mockListIssues = jest.fn<ReturnType<OctokitListForRepo>, Parameters<OctokitListForRepo>>();
let listForRepoSpy: jest.SpiedFunction<OctokitListForRepo>;
type PaginateRequest = (...args: never[]) => Promise<{data: unknown}>;
type PaginateAdapter = (objectMethod: PaginateRequest, params?: unknown) => Promise<unknown[]>;

const paginateAdapter: PaginateAdapter = async (objectMethod) => {
    const {data}: {data: unknown} = await objectMethod();
    return isUnknownArray(data) ? data : [];
};

beforeAll(() => {
    GithubUtils.initOctokitWithToken('fake_token');
    const internalOctokit = GithubUtils.internalOctokit;
    if (!internalOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }

    listForRepoSpy = jest.spyOn(internalOctokit.rest.issues, 'listForRepo').mockImplementation(mockListIssues);
    jest.spyOn(internalOctokit, 'paginate').mockImplementation(paginateAdapter);
});

afterEach(() => {
    listForRepoSpy.mockClear();
    mockListIssues.mockReset();
});

describe('DeployChecklistUtils', () => {
    describe('getDeployChecklist', () => {
        const baseIssue = createIssue({
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            title: 'Andrew Test Issue',
            labels: [
                {
                    id: 2783847782,
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                    name: 'StagingDeployCash',
                    color: '6FC269',
                    default: false,
                    description: '',
                },
            ],

            body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/21\r\n- [x] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/22\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/23\r\n\r\n`,
        });
        const issueWithDeployBlockers = {...baseIssue};

        issueWithDeployBlockers.body += `\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1\r\n- [x] https://github.com/${process.env.GITHUB_REPOSITORY}/issues/2\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1234\r\n`;

        const baseExpectedResponse: Partial<Awaited<ReturnType<typeof getDeployChecklist>>> = {
            PRList: [
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/21`,
                    number: 21,
                    isChecked: false,
                },
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/22`,
                    number: 22,
                    isChecked: true,
                },
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/23`,
                    number: 23,
                    isChecked: false,
                },
            ],
            PRListMobileExpensify: [],
            labels: [
                {
                    color: '6FC269',
                    default: false,
                    description: '',
                    id: 2783847782,
                    name: 'StagingDeployCash',
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                },
            ],
            version: '1.0.1-47',
            tag: '1.0.1-47-staging',
            title: 'Andrew Test Issue',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            number: 29,
            deployBlockers: [],
            internalQAPRList: [],
            isSentryChecked: false,
            isGHStatusChecked: false,
        };
        const expectedResponseWithDeployBlockers = {...baseExpectedResponse};
        expectedResponseWithDeployBlockers.deployBlockers = [
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1`,
                number: 1,
                isChecked: false,
            },
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/2`,
                number: 2,
                isChecked: true,
            },
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1234`,
                number: 1234,
                isChecked: false,
            },
        ];

        test('Test finding an open issue with no PRs successfully', () => {
            const bareIssue = createIssue({
                ...baseIssue,

                body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n`,
            });

            const bareExpectedResponse: Partial<Awaited<ReturnType<typeof getDeployChecklist>>> = {
                ...baseExpectedResponse,
                PRList: [],
                PRListMobileExpensify: [],
            };

            mockListIssues.mockResolvedValue(createListForRepoResponse([bareIssue]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(bareExpectedResponse));
        });

        test('Test finding an open issue successfully', () => {
            mockListIssues.mockResolvedValue(createListForRepoResponse([baseIssue]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(baseExpectedResponse));
        });

        test('Test finding an open issue successfully and parsing with deploy blockers', () => {
            mockListIssues.mockResolvedValue(createListForRepoResponse([issueWithDeployBlockers]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', () => {
            const modifiedIssueWithDeployBlockers = {...issueWithDeployBlockers};
            modifiedIssueWithDeployBlockers.body = (modifiedIssueWithDeployBlockers.body ?? '').replaceAll('\r', '');

            mockListIssues.mockResolvedValue(createListForRepoResponse([modifiedIssueWithDeployBlockers]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue without a body', () => {
            const noBodyIssue = {...baseIssue, body: ''};

            mockListIssues.mockResolvedValue(createListForRepoResponse([noBodyIssue]));
            return getDeployChecklist().then((data) =>
                expect(data).toMatchObject({
                    PRList: [],
                    PRListMobileExpensify: [],
                    deployBlockers: [],
                    internalQAPRList: [],
                    isSentryChecked: false,
                    isGHStatusChecked: false,
                    version: '',
                    tag: '-staging',
                }),
            );
        });

        test('Test finding more than one issue', async () => {
            mockListIssues.mockResolvedValue(createListForRepoResponse([createIssue({number: 1}), createIssue({number: 2})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toEqual(new Error('Found more than one open StagingDeployCash issue: #1, #2.'));
            }
        });

        test('state:open empty + state:all returns closed issue → NoOpenDeployChecklistError', async () => {
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createIssue({number: 100, state: 'closed'})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toEqual(expect.stringContaining('#100'));
            }
        });

        test('state:open empty + state:all returns open issue → fails closed (inconsistency)', async () => {
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createIssue({number: 500, state: 'open'})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toEqual(expect.stringContaining('Inconsistent GitHub response'));
                expect(e.message).toEqual(expect.stringContaining('#500'));
            }
        });

        test('state:open empty + state:all empty → fails closed (pathological)', async () => {
            mockListIssues.mockResolvedValue(createListForRepoResponse([]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toEqual(expect.stringContaining(`No StagingDeployCash issues found at all`));
            }
        });
    });

    describe('getDeployChecklist retry behaviour', () => {
        test('retries on thrown error then succeeds', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            mockListIssues
                .mockRejectedValueOnce(err503)
                .mockResolvedValueOnce(createListForRepoResponse([createIssue({number: 88, url: 'https://api.github.com/repos/o/i/issues/88', title: 't', labels: [], body: ''})]));

            jest.useFakeTimers();
            try {
                const pending = getDeployChecklist();
                await jest.advanceTimersByTimeAsync(2000);
                const data = await pending;

                expect(data.number).toBe(88);
                expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
            } finally {
                jest.useRealTimers();
            }
        });

        test('re-throws after all retry attempts fail', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            mockListIssues.mockRejectedValue(err503);

            jest.useFakeTimers();
            try {
                const pending = getDeployChecklist();
                const assertion = expect(pending).rejects.toThrow(RequestError);
                await jest.advanceTimersByTimeAsync(2000);
                await jest.advanceTimersByTimeAsync(5000);
                await assertion;

                expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(3);
            } finally {
                jest.useRealTimers();
            }
        });

        test('does not retry on empty result; falls through to state:all cross-check', async () => {
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createIssue({number: 200, state: 'closed'})]));
            await expect(getDeployChecklist()).rejects.toBeInstanceOf(NoOpenDeployChecklistError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('short-circuits permanent statuses (404) without retrying', async () => {
            const err404 = new RequestError('Not Found', 404, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            mockListIssues.mockRejectedValue(err404);

            await expect(getDeployChecklist()).rejects.toBeInstanceOf(RequestError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(1);
        });

        test('keeps 403 retryable (secondary rate limits)', async () => {
            const err403 = new RequestError('Secondary rate limit', 403, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            mockListIssues
                .mockRejectedValueOnce(err403)
                .mockResolvedValueOnce(createListForRepoResponse([createIssue({number: 77, url: 'https://api.github.com/repos/o/i/issues/77', title: 't', labels: [], body: ''})]));

            jest.useFakeTimers();
            try {
                const pending = getDeployChecklist();
                await jest.advanceTimersByTimeAsync(2000);
                const data = await pending;

                expect(data.number).toBe(77);
                expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
            } finally {
                jest.useRealTimers();
            }
        });

        test('state:all reports a non-first open issue → fails closed with that number', async () => {
            mockListIssues
                .mockResolvedValueOnce(createListForRepoResponse([]))
                .mockResolvedValueOnce(
                    createListForRepoResponse([createIssue({number: 900, state: 'closed'}), createIssue({number: 800, state: 'open'}), createIssue({number: 700, state: 'closed'})]),
                );
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toEqual(expect.stringContaining('Inconsistent GitHub response'));
                expect(e.message).toEqual(expect.stringContaining('#800'));
            }
        });
    });

    describe('generateDeployChecklistBody', () => {
        const mockPRs = [
            createPullRequest({
                number: 1,
                title: 'Test PR 1',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
                user: pullRequestUser,
                labels: [],
            }),
            createPullRequest({
                number: 2,
                title: 'Test PR 2',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
                user: pullRequestUser,
                labels: [],
            }),
            createPullRequest({
                number: 3,
                title: 'Test PR 3',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
                user: pullRequestUser,
                labels: [],
            }),
            createPullRequest({
                number: 4,
                title: '[NO QA] Test No QA PR uppercase',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`,
                user: pullRequestUser,
                labels: [],
            }),
            createPullRequest({
                number: 5,
                title: '[NoQa] Test No QA PR Title Case',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`,
                user: pullRequestUser,
                labels: [],
            }),
            createPullRequest({
                number: 6,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
                user: pullRequestUser,
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                        default: false,
                    },
                ],
                assignees: [],
            }),
            createPullRequest({
                number: 7,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`,
                user: pullRequestUser,
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                        default: false,
                    },
                ],
                assignees: [],
            }),
        ];
        const mockInternalQaPR = createPullRequest({
            merged_by: pullRequestUser,
        });
        const mockListPulls = jest.fn<ReturnType<OctokitListPulls>, Parameters<OctokitListPulls>>();
        mockListPulls.mockResolvedValue(createListPullsResponse(mockPRs));
        const mockGetPull = jest.fn<ReturnType<OctokitGetPull>, Parameters<OctokitGetPull>>();
        mockGetPull.mockResolvedValue(createGetPullResponse(mockInternalQaPR));

        beforeAll(() => {
            const internalOctokit = GithubUtils.internalOctokit;
            if (!internalOctokit) {
                throw new Error('Expected GithubUtils to initialize an Octokit client.');
            }
            jest.spyOn(internalOctokit.rest.pulls, 'list').mockImplementation(mockListPulls);
            jest.spyOn(internalOctokit.rest.pulls, 'get').mockImplementation(mockGetPull);
        });

        const tag = '1.0.2-12';
        const basePRList = [2, 3, 1, 3, 4, 5];
        const PRListMobileExpensify = [1, 2, 3];
        const internalQAPRList = [6, 7];

        const baseDeployBlockerList = [3, 4];

        const baseExpectedOutput = `**Release Version:** \`${tag}\`\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\n\n**This release contains changes from the following pull requests:**\n`;
        const openCheckbox = '- [ ] ';
        const closedCheckbox = '- [x] ';
        const ccApplauseLeads = 'cc @Expensify/applauseleads\n';
        const deployBlockerHeader = '\n**Deploy Blockers:**';
        const internalQAHeader = '\n\n**Internal QA:**';
        const lineBreak = '\n';
        const lineBreakDouble = '\n\n';
        const assignOctocat = ' - @octocat';
        const deployerVerificationsHeader = '\n**Deployer verifications:**';
        const sentryVerificationCurrentRelease = `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${tag}/?project=4510228107427840&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;
        const sentryVerificationPreviousRelease = `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40/?project=4510228107427840&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;
        const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';

        const prURL = (n: number) => `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/${n}`;
        const issueURL = (n: number) => `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${n}`;
        const mobileURL = (n: number) => `https://github.com/Expensify/Mobile-Expensify/pull/${n}`;

        const allVerifiedExpectedOutput =
            `${baseExpectedOutput}` +
            `${closedCheckbox}${prURL(1)}` +
            `${lineBreak}${closedCheckbox}${prURL(2)}` +
            `${lineBreak}${closedCheckbox}${prURL(3)}` +
            `${lineBreak}${closedCheckbox}${prURL(4)}` +
            `${lineBreak}${closedCheckbox}${prURL(5)}` +
            `${lineBreak}`;

        test('Test no verified PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, PRListMobileExpensify});
            const expectedOutputWithMobileExpensify = `**Release Version:** \`${tag}\`\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\n**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging\n\n**This release contains changes from the following pull requests:**\n`;
            expect(issue.issueBody).toBe(
                `${expectedOutputWithMobileExpensify}` +
                    `${openCheckbox}${prURL(1)}` +
                    `${lineBreak}${openCheckbox}${prURL(2)}` +
                    `${lineBreak}${openCheckbox}${prURL(3)}` +
                    `${lineBreak}${closedCheckbox}${prURL(4)}` +
                    `${lineBreak}${closedCheckbox}${prURL(5)}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${mobileURL(1)}` +
                    `${lineBreak}${openCheckbox}${mobileURL(2)}` +
                    `${lineBreak}${openCheckbox}${mobileURL(3)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test Mobile-Expensify compare link with Mobile-Expensify PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, PRListMobileExpensify});
            expect(issue.issueBody).toContain('**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging');
            expect(issue.issueBody).toContain('**Mobile-Expensify PRs:**');
        });

        test('Test no Mobile-Expensify compare link without Mobile-Expensify PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, PRListMobileExpensify: []});
            expect(issue.issueBody).not.toContain('**Mobile-Expensify Changes:**');
            expect(issue.issueBody).not.toContain('**Mobile-Expensify PRs:**');
        });

        test('Test some verified PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, verifiedPRList: [2]});
            expect(issue.issueBody).toBe(
                `${baseExpectedOutput}` +
                    `${openCheckbox}${prURL(1)}` +
                    `${lineBreak}${closedCheckbox}${prURL(2)}` +
                    `${lineBreak}${openCheckbox}${prURL(3)}` +
                    `${lineBreak}${closedCheckbox}${prURL(4)}` +
                    `${lineBreak}${closedCheckbox}${prURL(5)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test all verified PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, verifiedPRList: basePRList});
            expect(issue.issueBody).toBe(
                `${allVerifiedExpectedOutput}` +
                    `${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test no resolved deploy blockers', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: basePRList, verifiedPRList: basePRList, deployBlockers: baseDeployBlockerList});
            expect(issue.issueBody).toBe(
                `${allVerifiedExpectedOutput}` +
                    `${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${issueURL(3)}` +
                    `${lineBreak}${openCheckbox}${issueURL(4)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test some resolved deploy blockers', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({
                tag,
                PRList: basePRList,
                verifiedPRList: basePRList,
                deployBlockers: baseDeployBlockerList,
                resolvedDeployBlockers: [baseDeployBlockerList.at(0) ?? 0],
            });
            expect(issue.issueBody).toBe(
                `${allVerifiedExpectedOutput}` +
                    `${deployBlockerHeader}` +
                    `${lineBreak}${closedCheckbox}${issueURL(3)}` +
                    `${lineBreak}${openCheckbox}${issueURL(4)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test all resolved deploy blockers', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({
                tag,
                PRList: basePRList,
                verifiedPRList: basePRList,
                deployBlockers: baseDeployBlockerList,
                resolvedDeployBlockers: baseDeployBlockerList,
            });
            expect(issue.issueBody).toBe(
                `${baseExpectedOutput}` +
                    `${closedCheckbox}${prURL(1)}` +
                    `${lineBreak}${closedCheckbox}${prURL(2)}` +
                    `${lineBreak}${closedCheckbox}${prURL(3)}` +
                    `${lineBreak}${closedCheckbox}${prURL(4)}` +
                    `${lineBreak}${closedCheckbox}${prURL(5)}` +
                    `${lineBreak}${deployBlockerHeader}` +
                    `${lineBreak}${closedCheckbox}${issueURL(3)}` +
                    `${lineBreak}${closedCheckbox}${issueURL(4)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual([]);
        });

        test('Test internalQA PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: [...basePRList, ...internalQAPRList], PRListMobileExpensify});
            const expectedOutputWithMobileExpensify = `**Release Version:** \`${tag}\`\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\n**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging\n\n**This release contains changes from the following pull requests:**\n`;
            expect(issue.issueBody).toBe(
                `${expectedOutputWithMobileExpensify}` +
                    `${openCheckbox}${prURL(1)}` +
                    `${lineBreak}${openCheckbox}${prURL(2)}` +
                    `${lineBreak}${openCheckbox}${prURL(3)}` +
                    `${lineBreak}${closedCheckbox}${prURL(4)}` +
                    `${lineBreak}${closedCheckbox}${prURL(5)}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${mobileURL(1)}` +
                    `${lineBreak}${openCheckbox}${mobileURL(2)}` +
                    `${lineBreak}${openCheckbox}${mobileURL(3)}` +
                    `${internalQAHeader}` +
                    `${lineBreak}${openCheckbox}${prURL(6)}${assignOctocat}` +
                    `${lineBreak}${openCheckbox}${prURL(7)}${assignOctocat}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual(['octocat']);
        });

        test('Test some verified internalQA PRs', async () => {
            const issue = await generateDeployChecklistBodyAndAssignees({tag, PRList: [...basePRList, ...internalQAPRList], resolvedInternalQAPRs: [6]});
            expect(issue.issueBody).toBe(
                `${baseExpectedOutput}` +
                    `${openCheckbox}${prURL(1)}` +
                    `${lineBreak}${openCheckbox}${prURL(2)}` +
                    `${lineBreak}${openCheckbox}${prURL(3)}` +
                    `${lineBreak}${closedCheckbox}${prURL(4)}` +
                    `${lineBreak}${closedCheckbox}${prURL(5)}` +
                    `${internalQAHeader}` +
                    `${lineBreak}${closedCheckbox}${prURL(6)}${assignOctocat}` +
                    `${lineBreak}${openCheckbox}${prURL(7)}${assignOctocat}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            );
            expect(issue.issueAssignees).toEqual(['octocat']);
        });
    });
});
