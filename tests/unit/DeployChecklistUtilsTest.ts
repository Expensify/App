import {generateDeployChecklistBodyAndAssignees, getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import type {InternalOctokit, ListForRepoMethod} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {RequestError} from '@octokit/request-error';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

// bun:test's fake timers don't offer Jest's `advanceTimersByTimeAsync`, which flushes pending microtasks both
// before and after advancing timers in one step. Without an initial flush, the rejected `listForRepo` mock's
// `catch` block (which schedules the retry's `setTimeout`) hasn't run yet by the time we call
// `advanceTimersByTime`, so the timer is never registered and the retry hangs forever; flushing again afterwards
// lets the resolved timer's continuation (the next `listForRepo` attempt) run.
async function flushMicrotasks(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve();
    }
}

async function advanceTimersAndFlush(ms: number): Promise<void> {
    await flushMicrotasks();
    jest.advanceTimersByTime(ms);
    await flushMicrotasks();
}

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();

type Label = {
    id: number;
    number?: number;
    isChecked?: boolean;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
};

type Issue = {
    url: string;
    title: string;
    labels: Label[];
    body: string;
};

type ObjectMethodData<T> = {
    data: T;
};

type OctokitCreateIssue = InternalOctokit['rest']['issues']['create'];

beforeAll(() => {
    // Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't be reassigned
    // directly (unlike Jest's Babel-transpiled CJS interop); spy on it instead.
    jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);

    const mockOctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation((arg: Parameters<OctokitCreateIssue>[0]) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                        },
                    }),
                ),
                listForRepo: mockListIssues,
            },
        },
        paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
    } as unknown as InternalOctokit;

    GithubUtils.internalOctokit = mockOctokit;
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
});

afterAll(() => {
    // `bun test` runs all files in one process sharing GithubUtils' module-level state, unlike Jest's per-file
    // module registry; reset it so later test files re-initialize their own octokit mock from scratch.
    GithubUtils.internalOctokit = undefined;
});

describe('DeployChecklistUtils', () => {
    describe('getDeployChecklist', () => {
        const baseIssue: Issue = {
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
        };
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
            const bareIssue: Issue = {
                ...baseIssue,

                body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n`,
            };

            const bareExpectedResponse: Awaited<ReturnType<typeof getDeployChecklist>> = {
                ...baseExpectedResponse,
                PRList: [],
                PRListMobileExpensify: [],
            };

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [bareIssue]}) as unknown as ListForRepoMethod;
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(bareExpectedResponse));
        });

        test('Test finding an open issue successfully', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [baseIssue]}) as unknown as ListForRepoMethod;
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(baseExpectedResponse));
        });

        test('Test finding an open issue successfully and parsing with deploy blockers', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [issueWithDeployBlockers]}) as unknown as ListForRepoMethod;
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', () => {
            const modifiedIssueWithDeployBlockers = {...issueWithDeployBlockers};
            modifiedIssueWithDeployBlockers.body = modifiedIssueWithDeployBlockers.body.replaceAll('\r', '');

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({
                data: [modifiedIssueWithDeployBlockers],
            }) as unknown as ListForRepoMethod;
            return getDeployChecklist().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue without a body', () => {
            const noBodyIssue = baseIssue;
            noBodyIssue.body = '';

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [noBodyIssue]}) as unknown as ListForRepoMethod;
            return getDeployChecklist().catch((e) => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue with correct data.')));
        });

        test('Test finding more than one issue', async () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [{number: 1}, {number: 2}]}) as unknown as ListForRepoMethod;
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toEqual(new Error('Found more than one open StagingDeployCash issue: #1, #2.'));
            }
        });

        test('state:open empty + state:all returns closed issue → NoOpenDeployChecklistError', async () => {
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockResolvedValueOnce({data: []})
                .mockResolvedValueOnce({data: [{number: 100, state: 'closed'}]}) as unknown as ListForRepoMethod;
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(NoOpenDeployChecklistError);
                expect((e as Error).message).toContain('#100');
            }
        });

        test('state:open empty + state:all returns open issue → fails closed (inconsistency)', async () => {
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockResolvedValueOnce({data: []})
                .mockResolvedValueOnce({data: [{number: 500, state: 'open'}]}) as unknown as ListForRepoMethod;
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                expect((e as Error).message).toContain('Inconsistent GitHub response');
                expect((e as Error).message).toContain('#500');
            }
        });

        test('state:open empty + state:all empty → fails closed (pathological)', async () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: []}) as unknown as ListForRepoMethod;
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                expect((e as Error).message).toContain(`No StagingDeployCash issues found at all`);
            }
        });
    });

    describe('getDeployChecklist retry behaviour', () => {
        test('retries on thrown error then succeeds', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockRejectedValueOnce(err503)
                .mockResolvedValueOnce({data: [{number: 88, url: 'https://api.github.com/repos/o/i/issues/88', title: 't', labels: [], body: ''}]}) as unknown as ListForRepoMethod;

            jest.useFakeTimers();
            const pending = getDeployChecklist();
            await advanceTimersAndFlush(2000);
            const data = await pending;
            jest.useRealTimers();

            expect(data.number).toBe(88);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('re-throws after all retry attempts fail', async () => {
            const err503 = new RequestError('Service Unavailable', 503, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockRejectedValue(err503) as unknown as ListForRepoMethod;

            jest.useFakeTimers();
            const pending = getDeployChecklist();
            // Capturing the `.rejects` assertion in a variable before it's awaited (as the original Jest test did)
            // deadlocks bun's fake-timer microtask flushing below; awaiting the assertion directly once the
            // retries have played out avoids that.
            await advanceTimersAndFlush(2000);
            await advanceTimersAndFlush(5000);
            await expect(pending).rejects.toThrow(RequestError);
            jest.useRealTimers();

            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(3);
        });

        test('does not retry on empty result; falls through to state:all cross-check', async () => {
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockResolvedValueOnce({data: []})
                .mockResolvedValueOnce({data: [{number: 200, state: 'closed'}]}) as unknown as ListForRepoMethod;
            await expect(getDeployChecklist()).rejects.toBeInstanceOf(NoOpenDeployChecklistError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('short-circuits permanent statuses (404) without retrying', async () => {
            const err404 = new RequestError('Not Found', 404, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockRejectedValue(err404) as unknown as ListForRepoMethod;

            await expect(getDeployChecklist()).rejects.toBeInstanceOf(RequestError);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(1);
        });

        test('keeps 403 retryable (secondary rate limits)', async () => {
            const err403 = new RequestError('Secondary rate limit', 403, {
                request: {method: 'GET', url: 'https://api.github.com/repos/o/i/issues', headers: {}},
            });
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockRejectedValueOnce(err403)
                .mockResolvedValueOnce({data: [{number: 77, url: 'https://api.github.com/repos/o/i/issues/77', title: 't', labels: [], body: ''}]}) as unknown as ListForRepoMethod;

            jest.useFakeTimers();
            const pending = getDeployChecklist();
            await advanceTimersAndFlush(2000);
            const data = await pending;
            jest.useRealTimers();

            expect(data.number).toBe(77);
            expect(GithubUtils.octokit.issues.listForRepo).toHaveBeenCalledTimes(2);
        });

        test('state:all reports a non-first open issue → fails closed with that number', async () => {
            GithubUtils.octokit.issues.listForRepo = jest
                .fn()
                .mockResolvedValueOnce({data: []})
                .mockResolvedValueOnce({
                    data: [
                        {number: 900, state: 'closed'},
                        {number: 800, state: 'open'},
                        {number: 700, state: 'closed'},
                    ],
                }) as unknown as ListForRepoMethod;
            try {
                await getDeployChecklist();
                throw new Error('Expected getDeployChecklist to reject');
            } catch (e: unknown) {
                expect(e).not.toBeInstanceOf(NoOpenDeployChecklistError);
                expect((e as Error).message).toContain('Inconsistent GitHub response');
                expect((e as Error).message).toContain('#800');
            }
        });
    });

    describe('generateDeployChecklistBody', () => {
        const mockPRs = [
            {
                number: 1,
                title: 'Test PR 1',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 2,
                title: 'Test PR 2',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 3,
                title: 'Test PR 3',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 4,
                title: '[NO QA] Test No QA PR uppercase',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 5,
                title: '[NoQa] Test No QA PR Title Case',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 6,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
                user: {login: 'username'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
            {
                number: 7,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`,
                user: {login: 'username'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
        ];
        const mockInternalQaPR = {
            merged_by: {login: 'octocat'},
        };
        const mockGithub = jest.fn(() => ({
            getOctokit: () => ({
                rest: {
                    repos: {
                        listTags: jest.fn().mockResolvedValue({data: [{name: '1.0.2-0'}, {name: '1.0.2-12'}]}),
                    },
                    pulls: {
                        list: jest.fn().mockResolvedValue({data: mockPRs}),
                        get: jest.fn().mockResolvedValue({data: mockInternalQaPR}),
                    },
                },
                paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
            }),
        }));

        const octokit = mockGithub().getOctokit();

        beforeEach(() => {
            GithubUtils.internalOctokit = octokit as unknown as InternalOctokit;
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
