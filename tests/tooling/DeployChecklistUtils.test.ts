import type {Mock} from 'bun:test';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

import CONST from '@github/libs/CONST';
import {generateDeployChecklistBodyAndAssignees, getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import type {InternalOctokit, ListForRepoMethod, OctokitIssueItem} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

/* eslint-disable @typescript-eslint/naming-convention */
import {RequestError} from '@octokit/request-error';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

type ListForRepoResponse = Awaited<ReturnType<ListForRepoMethod>>;
type PullRequest = Exclude<Awaited<ReturnType<typeof GithubUtils.fetchAllPullRequests>>, void>[number];
type OctokitPaginate = InternalOctokit['paginate'];
type OctokitGetPullRequest = InternalOctokit['rest']['pulls']['get'];
type GetPullRequestResponse = Awaited<ReturnType<OctokitGetPullRequest>>;

const createListForRepoResponse = (data: OctokitIssueItem[]): ListForRepoResponse => createMock<ListForRepoResponse>({data});

let listForRepoSpy: Mock<ListForRepoMethod>;
let internalOctokit: InternalOctokit;

/**
 * Runs `operation` with fake timers so its retry backoff resolves instantly, advancing the clock by exactly
 * `expectedDelaysMs` in order. Advancing by the exact delays rather than some arbitrarily large amount keeps
 * these tests pinned to LIST_RETRY_DELAYS_MS: lengthen a delay there and the operation never settles.
 *
 * Bun only exposes a synchronous `jest.advanceTimersByTime`, and the code under test schedules each backoff timer
 * from a `catch` block - i.e. several microtasks after the call starts - so yield until that timer exists before
 * firing it.
 */
async function runWithFakeTimers<T>(operation: () => Promise<T>, expectedDelaysMs: number[]): Promise<T> {
    try {
        jest.useFakeTimers();
        let isSettled = false;
        const pending = operation().finally(() => {
            isSettled = true;
        });

        // The caller decides whether a rejection is expected; swallow it here only so driving the clock below
        // doesn't trip Bun's unhandled-rejection reporting in the meantime.
        pending.catch(() => {});

        for (const delayMs of expectedDelaysMs) {
            for (let i = 0; jest.getTimerCount() === 0 && !isSettled && i < 100; i++) {
                await Promise.resolve();
            }
            jest.advanceTimersByTime(delayMs);
        }

        for (let i = 0; !isSettled && i < 100; i++) {
            await Promise.resolve();
        }
        if (!isSettled) {
            throw new Error(`Operation did not settle after advancing the clock by ${expectedDelaysMs.join(' + ')}ms; did its retry schedule change?`);
        }
        return await pending;
    } finally {
        jest.useRealTimers();
    }
}

beforeAll(() => {
    GithubUtils.initOctokitWithToken('fake_token');
    const initializedOctokit = GithubUtils.internalOctokit;
    if (!initializedOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }

    internalOctokit = initializedOctokit;
    internalOctokit.rest.issues = materializeOctokitNamespace(internalOctokit.rest.issues);
    listForRepoSpy = jest.spyOn(internalOctokit.rest.issues, 'listForRepo');
});

afterEach(() => {
    listForRepoSpy.mockReset();
});

describe('DeployChecklistUtils', () => {
    describe('getDeployChecklist', () => {
        const baseIssue = createMock<OctokitIssueItem>({
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

        const baseExpectedResponse: Awaited<ReturnType<typeof getDeployChecklist>> = {
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
            const bareIssue = createMock<OctokitIssueItem>({
                ...baseIssue,

                body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n`,
            });

            const bareExpectedResponse: Awaited<ReturnType<typeof getDeployChecklist>> = {
                ...baseExpectedResponse,
                PRList: [],
                PRListMobileExpensify: [],
            };

            listForRepoSpy.mockResolvedValue(createListForRepoResponse([bareIssue]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(bareExpectedResponse));
        });

        test('Test finding an open issue successfully', () => {
            listForRepoSpy.mockResolvedValue(createListForRepoResponse([baseIssue]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(baseExpectedResponse));
        });

        test('Test finding an open issue successfully and parsing with deploy blockers', () => {
            listForRepoSpy.mockResolvedValue(createListForRepoResponse([issueWithDeployBlockers]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', () => {
            const modifiedIssueWithDeployBlockers = {...issueWithDeployBlockers};
            modifiedIssueWithDeployBlockers.body = (modifiedIssueWithDeployBlockers.body ?? '').replaceAll('\r', '');

            listForRepoSpy.mockResolvedValue(createListForRepoResponse([modifiedIssueWithDeployBlockers]));
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue without a body', () => {
            const noBodyIssue = {...baseIssue, body: ''};

            listForRepoSpy.mockResolvedValue(createListForRepoResponse([noBodyIssue]));
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

        test('Test finding an open issue with malformed URL', async () => {
            const malformedURLIssue = {...baseIssue, url: 'invalid-url'};

            listForRepoSpy.mockResolvedValue(createListForRepoResponse([malformedURLIssue]));
            await expect(getDeployChecklist()).rejects.toThrow(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue with correct data.`);
        });

        test('Test finding more than one issue', async () => {
            listForRepoSpy.mockResolvedValue(createListForRepoResponse([createMock<OctokitIssueItem>({number: 1}), createMock<OctokitIssueItem>({number: 2})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toEqual(new Error('Found more than one open StagingDeployCash issue: #1, #2.'));
            }
        });

        test('state:open empty + state:all returns closed issue → NoOpenDeployChecklistError', async () => {
            listForRepoSpy
                .mockResolvedValueOnce(createListForRepoResponse([]))
                .mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssueItem>({number: 100, state: 'closed'})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toContain('#100');
            }
        });

        test('state:open empty + state:all returns open issue → fails closed (inconsistency)', async () => {
            listForRepoSpy
                .mockResolvedValueOnce(createListForRepoResponse([]))
                .mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssueItem>({number: 500, state: 'open'})]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toContain('Inconsistent GitHub response');
                expect(e.message).toContain('#500');
            }
        });

        test('state:open empty + state:all empty → fails closed (pathological)', async () => {
            listForRepoSpy.mockResolvedValue(createListForRepoResponse([]));
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                if (!(e instanceof Error)) {
                    throw e;
                }
                expect(e.message).toContain(`No StagingDeployCash issues found at all`);
            }
        });
    });

    describe('getDeployChecklist retry behaviour', () => {
        test('retries on thrown error then succeeds', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            listForRepoSpy
                .mockRejectedValueOnce(err503)
                .mockResolvedValueOnce(
                    createListForRepoResponse([createMock<OctokitIssueItem>({number: 88, url: 'https://api.github.com/repos/o/i/issues/88', title: 't', labels: [], body: ''})]),
                );

            const data = await runWithFakeTimers(() => getDeployChecklist(), [2000]);

            expect(data.number).toBe(88);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('re-throws after all retry attempts fail', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            listForRepoSpy.mockRejectedValue(err503);

            await expect(runWithFakeTimers(() => getDeployChecklist(), [2000, 5000])).rejects.toThrow(RequestError);

            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(3);
        });

        test('does not retry on empty result; falls through to state:all cross-check', async () => {
            listForRepoSpy
                .mockResolvedValueOnce(createListForRepoResponse([]))
                .mockResolvedValueOnce(createListForRepoResponse([createMock<OctokitIssueItem>({number: 200, state: 'closed'})]));
            await expect(getDeployChecklist()).rejects.toBeInstanceOf(NoOpenDeployChecklistError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('short-circuits permanent statuses (404) without retrying', async () => {
            const err404 = new RequestError('Not Found', 404, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            listForRepoSpy.mockRejectedValue(err404);

            await expect(getDeployChecklist()).rejects.toBeInstanceOf(RequestError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(1);
        });

        test('keeps 403 retryable (secondary rate limits)', async () => {
            const err403 = new RequestError('Secondary rate limit', 403, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            listForRepoSpy
                .mockRejectedValueOnce(err403)
                .mockResolvedValueOnce(
                    createListForRepoResponse([createMock<OctokitIssueItem>({number: 77, url: 'https://api.github.com/repos/o/i/issues/77', title: 't', labels: [], body: ''})]),
                );

            const data = await runWithFakeTimers(() => getDeployChecklist(), [2000]);

            expect(data.number).toBe(77);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('state:all reports a non-first open issue → fails closed with that number', async () => {
            listForRepoSpy
                .mockResolvedValueOnce(createListForRepoResponse([]))
                .mockResolvedValueOnce(
                    createListForRepoResponse([
                        createMock<OctokitIssueItem>({number: 900, state: 'closed'}),
                        createMock<OctokitIssueItem>({number: 800, state: 'open'}),
                        createMock<OctokitIssueItem>({number: 700, state: 'closed'}),
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
                expect(e.message).toContain('Inconsistent GitHub response');
                expect(e.message).toContain('#800');
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
        let paginateSpy: Mock<OctokitPaginate>;
        let getPullRequestSpy: Mock<OctokitGetPullRequest>;

        beforeAll(() => {
            paginateSpy = jest.spyOn(internalOctokit, 'paginate');
            internalOctokit.rest.pulls = materializeOctokitNamespace(internalOctokit.rest.pulls);
            getPullRequestSpy = jest.spyOn(internalOctokit.rest.pulls, 'get');
        });

        beforeEach(() => {
            paginateSpy.mockResolvedValue(mockPRs);
            // Octokit endpoint methods carry `defaults`/`endpoint` statics that mockImplementation insists on but
            // the action never touches, so the stub only implements the call signature.
            const getPullRequest = async (parameters?: Parameters<OctokitGetPullRequest>[0]) => {
                if (!parameters) {
                    throw new Error('Expected pull request parameters.');
                }
                const {pull_number} = parameters;
                const pullRequest = mockPRs.find(({number, labels}) => number === pull_number && labels.some(({name}) => name === CONST.LABELS.INTERNAL_QA));
                return createMock<GetPullRequestResponse>({
                    data: {
                        merged_by: pullRequest ? {login: 'octocat'} : null,
                    },
                });
            };
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the stub deliberately omits the statics described above
            getPullRequestSpy.mockImplementation(getPullRequest as unknown as OctokitGetPullRequest);
        });

        afterEach(() => {
            paginateSpy.mockReset();
            getPullRequestSpy.mockReset();
        });

        afterAll(() => {
            paginateSpy.mockRestore();
            getPullRequestSpy.mockRestore();
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
            expect(paginateSpy).toHaveBeenCalledWith(GithubUtils.octokit.pulls.list, expect.objectContaining({repo: CONST.MOBILE_EXPENSIFY_REPO}), expect.any(Function));
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
