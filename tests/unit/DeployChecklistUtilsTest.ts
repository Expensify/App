import CONST from '@github/libs/CONST';
import {generateDeployChecklistBodyAndAssignees, getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';

/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention */
import {RequestError} from '@octokit/request-error';

import createMock from '../utils/createMock';

type Octokit = typeof GithubUtils.octokit;
type OctokitListForRepo = Octokit['issues']['listForRepo'];
type ListForRepoResponse = Awaited<ReturnType<OctokitListForRepo>>;
type OctokitIssue = ListForRepoResponse['data'][number];
type PullRequest = Exclude<Awaited<ReturnType<typeof GithubUtils.fetchAllPullRequests>>, void>[number];

const createListForRepoResponse = (data: OctokitIssue[]): ListForRepoResponse => createMock<ListForRepoResponse>({data});

const mockListIssues = jest.fn<ReturnType<OctokitListForRepo>, Parameters<OctokitListForRepo>>();
let listForRepoSpy: jest.SpiedFunction<OctokitListForRepo>;

beforeAll(() => {
    GithubUtils.initOctokitWithToken('fake_token');
    const internalOctokit = GithubUtils.internalOctokit;
    if (!internalOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }

    listForRepoSpy = jest.spyOn(internalOctokit.rest.issues, 'listForRepo').mockImplementation(mockListIssues);
});

afterEach(() => {
    listForRepoSpy.mockClear();
    mockListIssues.mockReset();
});

describe('DeployChecklistUtils', () => {
    describe('getDeployChecklist', () => {
        const baseIssue = createMock<OctokitIssue>({
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
            const bareIssue = createMock<OctokitIssue>({
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
            mockListIssues.mockResolvedValue(createListForRepoResponse([createMock<OctokitIssue>({number: 1}), createMock<OctokitIssue>({number: 2})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toEqual(new Error('Found more than one open StagingDeployCash issue: #1, #2.'));
            }
        });

        test('state:open empty + state:all returns closed issue → NoOpenDeployChecklistError', async () => {
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssue>({number: 100, state: 'closed'})]));
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
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssue>({number: 500, state: 'open'})]));
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
                .mockResolvedValueOnce(
                    createListForRepoResponse([createMock<OctokitIssue>({number: 88, url: 'https://api.github.com/repos/o/i/issues/88', title: 't', labels: [], body: ''})]),
                );

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
            mockListIssues.mockResolvedValueOnce(createListForRepoResponse([])).mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssue>({number: 200, state: 'closed'})]));
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
                .mockResolvedValueOnce(
                    createListForRepoResponse([createMock<OctokitIssue>({number: 77, url: 'https://api.github.com/repos/o/i/issues/77', title: 't', labels: [], body: ''})]),
                );

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
                    createListForRepoResponse([
                        createMock<OctokitIssue>({number: 900, state: 'closed'}),
                        createMock<OctokitIssue>({number: 800, state: 'open'}),
                        createMock<OctokitIssue>({number: 700, state: 'closed'}),
                    ]),
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
            createMock<PullRequest>({number: 1, title: 'Test PR 1', labels: []}),
            createMock<PullRequest>({number: 2, title: 'Test PR 2', labels: []}),
            createMock<PullRequest>({number: 3, title: 'Test PR 3', labels: []}),
            createMock<PullRequest>({number: 4, title: '[NO QA] Test No QA PR uppercase', labels: []}),
            createMock<PullRequest>({number: 5, title: '[NoQa] Test No QA PR Title Case', labels: []}),
            createMock<PullRequest>({number: 6, title: '[Internal QA] Another Test Internal QA PR', labels: [{name: 'InternalQA'}]}),
            createMock<PullRequest>({number: 7, title: '[Internal QA] Another Test Internal QA PR', labels: [{name: 'InternalQA'}]}),
        ];
        const mockPullRequestsByRepo: Record<string, PullRequest[]> = {
            [CONST.APP_REPO]: mockPRs,
            [CONST.MOBILE_EXPENSIFY_REPO]: mockPRs,
        };
        const mockFetchAllPullRequests = jest.spyOn(GithubUtils, 'fetchAllPullRequests');
        const mockGetPullRequestMergerLogin = jest.spyOn(GithubUtils, 'getPullRequestMergerLogin');

        beforeEach(() => {
            mockFetchAllPullRequests.mockImplementation(async (pullRequestNumbers, repo = CONST.APP_REPO) => {
                const pullRequests = mockPullRequestsByRepo[repo] ?? [];
                return pullRequests.filter(({number}) => pullRequestNumbers.includes(number));
            });
            mockGetPullRequestMergerLogin.mockImplementation(async (pullRequestNumber) => {
                const pullRequest = mockPRs.find(({number, labels}) => number === pullRequestNumber && labels.some(({name}) => name === CONST.LABELS.INTERNAL_QA));
                return pullRequest ? 'octocat' : undefined;
            });
        });

        afterEach(() => {
            mockFetchAllPullRequests.mockReset();
            mockGetPullRequestMergerLogin.mockReset();
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
            expect(mockFetchAllPullRequests).toHaveBeenCalledWith(PRListMobileExpensify, CONST.MOBILE_EXPENSIFY_REPO);
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
