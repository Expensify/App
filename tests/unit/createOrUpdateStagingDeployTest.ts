import * as core from '@actions/core';
import * as fns from 'date-fns';
import {vol} from 'memfs';
import path from 'path';
import run from '@github/actions/javascript/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy';
import CONST from '@github/libs/CONST';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/naming-convention */

// Mock fs
jest.mock('fs');

// Mock @actions/core for input handling and logging in tests
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    info: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    setFailed: jest.fn(),
}));

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

type Arguments = {
    issue_number?: number;
    labels?: string;
};

const PATH_TO_PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

const mockListIssues = jest.fn();
const mockGetMergedPRsDeployedBetween = jest.fn() as jest.MockedFunction<typeof GitUtils.getMergedPRsDeployedBetween>;
const mockGetWorkflowRunURLForCommit = jest.fn().mockResolvedValue(undefined);

beforeAll(() => {
    // Mock octokit module
    const mockOctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation((arg: Arguments) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                        },
                    }),
                ),
                update: jest.fn().mockImplementation((arg: Arguments) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${arg.issue_number}`,
                        },
                    }),
                ),
                listForRepo: mockListIssues,
            },
            pulls: {
                // Static mock for pulls.list (only used to filter out automated PRs, and that functionality is covered
                // in the test for GithubUtils.generateStagingDeployCashBody
                list: jest.fn().mockResolvedValue([]),
            },
        },
        paginate: jest
            .fn()
            .mockImplementation((objectMethod: (args: Record<string, unknown>) => Promise<{data: unknown}>, args: Record<string, unknown>) => objectMethod(args).then(({data}) => data)),
    } as unknown as InternalOctokit;
    GithubUtils.internalOctokit = mockOctokit;

    // Mock GitUtils
    GitUtils.getMergedPRsDeployedBetween = mockGetMergedPRsDeployedBetween;
    GithubUtils.getWorkflowRunURLForCommit = mockGetWorkflowRunURLForCommit;
    mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));

    vol.reset();
    vol.fromJSON({
        [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
    });
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetMergedPRsDeployedBetween.mockClear();
    mockGetWorkflowRunURLForCommit.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

const LABELS = {
    STAGING_DEPLOY_CASH: {
        id: 2783847782,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/labels/StagingDeployCash`,
        name: CONST.LABELS.STAGING_DEPLOY,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/labels/DeployBlockerCash`,
        name: CONST.LABELS.DEPLOY_BLOCKER,
        color: '000000',
        default: false,
        description: 'This issue or pull request should block deployment',
    },
};

const basePRList = [
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/9`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/10`,
];

const baseMobileExpensifyPRList = [
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/20`,
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/21`,
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/22`,
];

const baseIssueList = [`https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`];
// eslint-disable-next-line max-len
const baseExpectedOutput = (version = '1.0.2-1', includeMobileExpensifyCompare = true) =>
    // cspell:disable
    `**Release Version:** \`${version}\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n${includeMobileExpensifyCompare ? `**Mobile-Expensify Changes:** https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/compare/production...staging\r\n` : ''}\r\n**This release contains changes from the following pull requests:**\r\n`;
// cspell:enable
const openCheckbox = '- [ ] ';
const closedCheckbox = '- [x] ';
const deployerVerificationsHeader = '**Deployer verifications:**';
// eslint-disable-next-line max-len
const sentryVerificationCurrentRelease = (version: string) =>
    `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${version}/?project=app&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;
// eslint-disable-next-line max-len
const sentryVerificationPreviousRelease = (version: string) =>
    `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${version}/?project=app&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;
// eslint-disable-next-line max-len
const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';
const ccApplauseLeads = `cc @Expensify/applauseleads\r\n`;
const deployBlockerHeader = '**Deploy Blockers:**';
const lineBreak = '\r\n';
const lineBreakDouble = '\r\n\r\n';

describe('createOrUpdateStagingDeployCash', () => {
    const closedStagingDeployCash = {
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/28`,
        title: 'Test StagingDeployCash',
        number: 28,
        labels: [LABELS.STAGING_DEPLOY_CASH],
        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
        // eslint-disable-next-line max-len
        body:
            `${baseExpectedOutput('1.0.1-0')}` +
            `${closedCheckbox}${basePRList.at(0)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(1)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(2)}${lineBreak}` +
            `${lineBreakDouble}${deployBlockerHeader}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(0)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(3)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
            `${lineBreakDouble}${ccApplauseLeads}`,
    };

    const baseNewPullRequests = [6, 7, 8];

    function toMergedPRs(prNumbers: number[]) {
        return {
            mergedPRs: prNumbers.map((num, index) => ({
                prNumber: num,
                date: `2024-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
            })),
            submoduleUpdates: [],
        };
    }

    type ChronologicalEntry = {type: 'pr'; prNumber: number} | {type: 'submodule'; version: string; buildLink?: string; commit?: string; mobileExpensifyPRs?: number[]};

    function buildChronologicalSection(entries: number[] | ChronologicalEntry[], pendingMobileExpensifyPRs: number[] = []): string {
        let normalizedEntries: ChronologicalEntry[];
        if (entries.length === 0) {
            normalizedEntries = [];
        } else if (typeof entries[0] === 'number') {
            normalizedEntries = (entries as number[]).map((n): ChronologicalEntry => ({type: 'pr', prNumber: n}));
        } else {
            normalizedEntries = entries as ChronologicalEntry[];
        }

        if (normalizedEntries.length === 0) {
            return '';
        }

        let section = '<details>\r\n<summary><b>Chronologically ordered merged PRs (oldest first)</b></summary>\r\n\r\n';
        let prIndex = 0;
        for (const entry of normalizedEntries) {
            if (entry.type === 'submodule') {
                prIndex++;
                const buildLink = entry.buildLink ? ` — [Adhoc Build](${entry.buildLink})` : ` — ${(entry.commit ?? '').substring(0, 7)}`;
                section += `${prIndex}. Mobile-Expensify submodule update to \`${entry.version}\`${buildLink}\r\n`;
                if (entry.mobileExpensifyPRs) {
                    for (const mobileExpensifyPR of entry.mobileExpensifyPRs) {
                        section += `   ↳ https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/${mobileExpensifyPR}\r\n`;
                    }
                }
            } else {
                prIndex++;
                section += `${prIndex}. https://github.com/${process.env.GITHUB_REPOSITORY}/pull/${entry.prNumber}\r\n`;
            }
        }
        if (pendingMobileExpensifyPRs.length > 0) {
            section += `\r\n--- PRs waiting for Mobile-Expensify submodule update\r\n`;
            for (const mobileExpensifyPR of pendingMobileExpensifyPRs) {
                section += `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/${mobileExpensifyPR}\r\n`;
            }
        }
        section += '\r\n</details>';
        return section;
    }

    test('creates new issue when there is none open', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
        });

        // cspell:disable-next-line
        mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return toMergedPRs([20, 21, 22]); // Mobile-Expensify PRs
                }
                return toMergedPRs(baseNewPullRequests); // App PRs
            }
            return {mergedPRs: [], submoduleUpdates: []};
        });

        mockListIssues.mockImplementation((args: Arguments) => {
            if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                return Promise.resolve({data: [closedStagingDeployCash]});
            }

            return Promise.resolve({data: []});
        });

        const result = await run();
        expect(result).toStrictEqual({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            title: `Deploy Checklist: New Expensify ${fns.format(new Date(), 'yyyy-MM-dd')}`,
            labels: [CONST.LABELS.STAGING_DEPLOY, CONST.LABELS.LOCK_DEPLOY],
            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput()}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}${lineBreak}` +
                `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests, [20, 21, 22])}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${openCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
        });
    });

    test('creates new issue when there are no Mobile-Expensify PRs', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
        });

        // Mock: No Mobile-Expensify PRs found for this release
        mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                }
                return toMergedPRs(baseNewPullRequests); // App PRs
            }
            return {mergedPRs: [], submoduleUpdates: []};
        });

        mockListIssues.mockImplementation((args: Arguments) => {
            if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                return Promise.resolve({data: [closedStagingDeployCash]});
            }

            return Promise.resolve({data: []});
        });

        const result = await run();
        expect(result).toStrictEqual({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            title: `Deploy Checklist: New Expensify ${fns.format(new Date(), 'yyyy-MM-dd')}`,
            labels: [CONST.LABELS.STAGING_DEPLOY, CONST.LABELS.LOCK_DEPLOY],
            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput('1.0.2-1', false)}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                // Note: No Mobile-Expensify PRs section since there are none
                `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests)}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${openCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
        });
    });

    describe('updates existing issue when there is one open', () => {
        const openStagingDeployCashBefore = {
            url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/29`,
            title: 'Test StagingDeployCash',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],
            // eslint-disable-next-line max-len
            body:
                `${baseExpectedOutput()}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}${deployBlockerHeader}` +
                `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(9)}${lineBreak}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${closedCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
            state: 'open',
        };

        const currentDeployBlockers = [
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
                number: 6,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/9`,
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/10`,
                number: 10,
                state: 'closed',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
        ];

        test('with NPM_VERSION input, pull requests, and deploy blockers', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-2'}),
            });

            // New pull requests to add to open StagingDeployCash
            const newPullRequests = [9, 10];
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 21, 22, 23, 24]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs([...baseNewPullRequests, ...newPullRequests]);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [openStagingDeployCashBefore, closedStagingDeployCash]});
                }

                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return Promise.resolve({
                        data: [
                            ...currentDeployBlockers,
                            {
                                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`, // New
                                number: 12,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                        ],
                    });
                }

                return Promise.resolve({data: []});
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openStagingDeployCashBefore.number,
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-2')}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(9)}${lineBreak}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}` +
                    `${lineBreak}${openCheckbox}https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/23` +
                    `${lineBreak}${openCheckbox}https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/24${lineBreak}` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(1)}${lineBreak}` +
                    `${lineBreakDouble}${buildChronologicalSection([...baseNewPullRequests, ...newPullRequests], [20, 21, 22, 23, 24])}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-2')}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });

        test('without NPM_VERSION input, just a new deploy blocker', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });
            // cspell:disable-next-line
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 21, 22]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs(baseNewPullRequests);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });
            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [openStagingDeployCashBefore, closedStagingDeployCash]});
                }

                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return Promise.resolve({
                        data: [
                            // Suppose the first deploy blocker is demoted, it should not be removed from the checklist and instead just be checked off
                            ...currentDeployBlockers.slice(1),
                            {
                                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`, // New
                                number: 12,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                        ],
                    });
                }

                return Promise.resolve({data: []});
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openStagingDeployCashBefore.number,
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-1')}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}${lineBreak}` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(1)}${lineBreak}` +
                    `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests, [20, 21, 22])}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });

        test('without Mobile-Expensify PRs, just app PRs and deploy blockers', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            // Mock: No Mobile-Expensify PRs found for this release
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                    }
                    return toMergedPRs(baseNewPullRequests);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });
            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [openStagingDeployCashBefore, closedStagingDeployCash]});
                }

                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return Promise.resolve({data: currentDeployBlockers});
                }

                return Promise.resolve({data: []});
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openStagingDeployCashBefore.number,
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-1', false)}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                    // Note: No Mobile-Expensify PRs section since there are none
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}${lineBreak}` +
                    `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests)}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });
    });

    describe('cherry-pick filtering', () => {
        test('filters out PRs that were already included in previous checklist', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.3-0'}),
            });

            mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));
            // cspell:disable-next-line
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 22, 24, 25]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs([6, 8, 10, 11]); // App PRs
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            // Mock previous checklist containing PRs 6,8
            const mockGetStagingDeployCashData = jest.spyOn(GithubUtils, 'getStagingDeployCashData');
            mockGetStagingDeployCashData.mockImplementation(() => ({
                title: 'Previous Checklist',
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                PRList: [
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`, number: 6, isVerified: true},
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`, number: 8, isVerified: true},
                ],
                PRListMobileExpensify: [
                    {url: `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/20`, number: 20, isVerified: true},
                    {url: `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/22`, number: 22, isVerified: true},
                ],
                deployBlockers: [],
                internalQAPRList: [],
                isTimingDashboardChecked: true,
                isSentryChecked: true,
                isGHStatusChecked: true,
                version: '1.0.2-1',
                tag: '1.0.2-1-staging',
            }));

            // Mock list of issues to return a closed previous checklist
            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({
                        data: [
                            {
                                number: 29,
                                state: 'closed',
                                labels: [LABELS.STAGING_DEPLOY_CASH],
                            },
                        ],
                    });
                }
                return Promise.resolve({data: []});
            });

            const result = await run();

            // Verify that only new PRs (10, 11) are included, not the previously included ones (6, 8)
            expect(result?.body).toContain('https://github.com/Expensify/App/pull/10');
            expect(result?.body).toContain('https://github.com/Expensify/App/pull/11');
            expect(result?.body).not.toContain('https://github.com/Expensify/App/pull/6');
            expect(result?.body).not.toContain('https://github.com/Expensify/App/pull/8');

            mockGetStagingDeployCashData.mockRestore();
        });

        test('filters out PRs when no Mobile-Expensify PRs exist', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.3-0'}),
            });

            mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));
            // Mock: no Mobile-Expensify PRs found
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                    }
                    return toMergedPRs([6, 8, 10, 11]); // App PRs
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            // Mock previous checklist containing PRs 6,8 but no Mobile-Expensify PRs
            const mockGetStagingDeployCashData = jest.spyOn(GithubUtils, 'getStagingDeployCashData');
            mockGetStagingDeployCashData.mockImplementation(() => ({
                title: 'Previous Checklist',
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                PRList: [
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`, number: 6, isVerified: true},
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`, number: 8, isVerified: true},
                ],
                PRListMobileExpensify: [], // No Mobile-Expensify PRs in previous checklist
                deployBlockers: [],
                internalQAPRList: [],
                isTimingDashboardChecked: true,
                isSentryChecked: true,
                isGHStatusChecked: true,
                tag: '1.0.2-1-staging',
                version: '1.0.2-1',
            }));

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({
                        data: [
                            {
                                number: 29,
                                state: 'closed',
                                labels: [LABELS.STAGING_DEPLOY_CASH],
                            },
                        ],
                    });
                }
                return Promise.resolve({data: []});
            });

            const result = await run();

            // Verify that only new PRs (10, 11) are included, not the previously included ones (6, 8)
            expect(result?.body).toContain('https://github.com/Expensify/App/pull/10');
            expect(result?.body).toContain('https://github.com/Expensify/App/pull/11');
            expect(result?.body).not.toContain('https://github.com/Expensify/App/pull/6');
            expect(result?.body).not.toContain('https://github.com/Expensify/App/pull/8');

            // Verify no Mobile-Expensify PRs section exists
            expect(result?.body).not.toContain('**Mobile-Expensify PRs:**');
            expect(result?.body).not.toContain('Mobile-Expensify/pull/');

            mockGetStagingDeployCashData.mockRestore();
        });
    });

    describe('chronological section with submodule updates', () => {
        test('interleaves submodule markers with PRs, groups Mobile-Expensify PRs, and renders build links', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            const workflowRunURL = 'https://github.com/Expensify/App/actions/runs/12345';

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T12:00:00Z'},
                                {prNumber: 21, date: '2024-01-02T12:00:00Z'},
                                {prNumber: 22, date: '2024-01-03T12:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-03T00:00:00Z'},
                            {prNumber: 8, date: '2024-01-05T00:00:00Z'},
                        ],
                        submoduleUpdates: [
                            {version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'},
                            {version: '9f18fca', date: '2024-01-04T00:00:00Z', commit: 'def4567890123'},
                        ],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockGetWorkflowRunURLForCommit.mockImplementation(async (commit: string) => {
                if (commit === 'abc1234567890') {
                    return workflowRunURL;
                }
                return undefined;
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [closedStagingDeployCash]});
                }
                return Promise.resolve({data: []});
            });

            const result = await run();
            const body = result?.body ?? '';

            const expectedChronologicalSection = buildChronologicalSection([
                {type: 'pr', prNumber: 6},
                {type: 'submodule', version: '9.3.21-0', buildLink: workflowRunURL, mobileExpensifyPRs: [20]},
                {type: 'pr', prNumber: 7},
                {type: 'submodule', version: '9f18fca', commit: 'def4567890123', mobileExpensifyPRs: [21, 22]},
                {type: 'pr', prNumber: 8},
            ]);
            expect(body).toContain(expectedChronologicalSection);
        });

        test('Mobile-Expensify PRs after the last submodule update are listed as pending at the bottom', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetWorkflowRunURLForCommit.mockResolvedValue(undefined);
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 30, date: '2024-01-05T00:00:00Z'},
                                {prNumber: 31, date: '2024-01-06T00:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [{prNumber: 6, date: '2024-01-01T00:00:00Z'}],
                        submoduleUpdates: [{version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'}],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [closedStagingDeployCash]});
                }
                return Promise.resolve({data: []});
            });

            const result = await run();
            const body = result?.body ?? '';

            const expectedChronologicalSection = buildChronologicalSection(
                [
                    {type: 'pr', prNumber: 6},
                    {type: 'submodule', version: '9.3.21-0', commit: 'abc1234567890'},
                ],
                [30, 31],
            );
            expect(body).toContain(expectedChronologicalSection);
        });

        test('update existing checklist with submodule interleaving preserves verified state', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-2'}),
            });

            const workflowRunURL = 'https://github.com/Expensify/App/actions/runs/99999';

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T12:00:00Z'},
                                {prNumber: 21, date: '2024-01-03T12:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-03T00:00:00Z'},
                            {prNumber: 8, date: '2024-01-05T00:00:00Z'},
                        ],
                        submoduleUpdates: [{version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'}],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockGetWorkflowRunURLForCommit.mockImplementation(async () => workflowRunURL);

            const openStagingDeployCashWithSubmodule = {
                url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/29`,
                title: 'Test StagingDeployCash',
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                body:
                    `${baseExpectedOutput()}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
                state: 'open',
            };

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [openStagingDeployCashWithSubmodule, closedStagingDeployCash]});
                }
                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return Promise.resolve({data: []});
                }
                return Promise.resolve({data: []});
            });

            const result = await run();
            const body = result?.body ?? '';

            // Verify the chronological section contains submodule interleaving.
            // Mobile-Expensify PR 21 (Jan 3 12:00) is after the only submodule bump (Jan 2), so it's pending.
            const expectedChronologicalSection = buildChronologicalSection(
                [
                    {type: 'pr', prNumber: 6},
                    {type: 'submodule', version: '9.3.21-0', buildLink: workflowRunURL, mobileExpensifyPRs: [20]},
                    {type: 'pr', prNumber: 7},
                    {type: 'pr', prNumber: 8},
                ],
                [21],
            );
            expect(body).toContain(expectedChronologicalSection);

            // Verify the existing verified state is preserved (PR 7 was verified in previous checklist)
            expect(body).toContain(`${closedCheckbox}${basePRList.at(6)}`);

            // Verify this is an update (not a create) by checking the issue_number
            expect(result).toHaveProperty('issue_number', 29);
        });

        test('each Mobile-Expensify PR appears under exactly one submodule update, not duplicated across multiple', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetWorkflowRunURLForCommit.mockResolvedValue(undefined);

            // Simulate many submodule updates with only 2 Mobile-Expensify PRs merged between them.
            // Mobile-Expensify PR #20 merged at 13:45 → should match submodule 9.3.21-2 (14:00), the first with date >= 13:45
            // Mobile-Expensify PR #21 merged at 15:30 → should match submodule 9.3.21-4 (16:00), the first with date >= 15:30
            // All other submodule updates should have NO Mobile-Expensify PRs underneath.
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T13:45:00Z'},
                                {prNumber: 21, date: '2024-01-01T15:30:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T10:00:00Z'},
                            {prNumber: 7, date: '2024-01-01T17:00:00Z'},
                        ],
                        // cspell:disable
                        submoduleUpdates: [
                            {version: '9.3.21-0', date: '2024-01-01T11:00:00Z', commit: 'aabbccddee'},
                            {version: '9.3.21-1', date: '2024-01-01T12:00:00Z', commit: 'bbccddeeaa'},
                            {version: '9.3.21-2', date: '2024-01-01T14:00:00Z', commit: 'ccddeeffbb'},
                            {version: '9.3.21-3', date: '2024-01-01T15:00:00Z', commit: 'ddeeffaacc'},
                            {version: '9.3.21-4', date: '2024-01-01T16:00:00Z', commit: 'eeffaabbdd'},
                            {version: '9.3.21-5', date: '2024-01-01T18:00:00Z', commit: 'ffaabbccee'},
                        ],
                        // cspell:enable
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [closedStagingDeployCash]});
                }
                return Promise.resolve({data: []});
            });

            const result = await run();
            const body = result?.body ?? '';

            // Mobile-Expensify PR #20 should ONLY appear under 9.3.21-2, and PR #21 ONLY under 9.3.21-4
            // cspell:disable
            const expectedChronologicalSection = buildChronologicalSection([
                {type: 'pr', prNumber: 6},
                {type: 'submodule', version: '9.3.21-0', commit: 'aabbccddee'},
                {type: 'submodule', version: '9.3.21-1', commit: 'bbccddeeaa'},
                {type: 'submodule', version: '9.3.21-2', commit: 'ccddeeffbb', mobileExpensifyPRs: [20]},
                {type: 'submodule', version: '9.3.21-3', commit: 'ddeeffaacc'},
                {type: 'submodule', version: '9.3.21-4', commit: 'eeffaabbdd', mobileExpensifyPRs: [21]},
                {type: 'pr', prNumber: 7},
                {type: 'submodule', version: '9.3.21-5', commit: 'ffaabbccee'},
            ]);
            // cspell:enable
            expect(body).toContain(expectedChronologicalSection);

            // Verify no duplication: each Mobile-Expensify PR URL should appear exactly once in the chronological section
            const chronologicalMatch = body.match(/<details>[\s\S]*?<\/details>/);
            expect(chronologicalMatch).not.toBeNull();
            const chronologicalContent = chronologicalMatch?.[0] ?? '';
            expect(chronologicalContent.match(/Mobile-Expensify\/pull\/20/g)).toHaveLength(1);
            expect(chronologicalContent.match(/Mobile-Expensify\/pull\/21/g)).toHaveLength(1);
        });

        test('chronological section without submodule updates shows only PRs', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []};
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-02T00:00:00Z'},
                        ],
                        submoduleUpdates: [],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return Promise.resolve({data: [closedStagingDeployCash]});
                }
                return Promise.resolve({data: []});
            });

            const result = await run();
            const body = result?.body ?? '';

            const expectedChronologicalSection = buildChronologicalSection([6, 7]);
            expect(body).toContain(expectedChronologicalSection);
            expect(body).not.toContain('submodule update');
            expect(body).not.toContain('Adhoc Build');
        });
    });
});
