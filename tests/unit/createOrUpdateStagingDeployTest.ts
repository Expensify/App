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
const mockGetPullRequestsDeployedBetween = jest.fn();

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
    GitUtils.getPullRequestsDeployedBetween = mockGetPullRequestsDeployedBetween;
    mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));

    vol.reset();
    vol.fromJSON({
        [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
    });
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetPullRequestsDeployedBetween.mockClear();
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
const firebaseVerificationCurrentRelease =
    'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/ios:com.expensify.expensifylite/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
// eslint-disable-next-line max-len
const firebaseVerificationPreviousRelease =
    'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/android:org.me.mobiexpensifyg/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **the previous release version** and verified that the release did not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
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

    test('creates new issue when there is none open', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
        });

        // cspell:disable-next-line
        mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return [20, 21, 22]; // Mobile-Expensify PRs
                }
                return [...baseNewPullRequests]; // App PRs
            }
            return [];
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
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
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
        mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return []; // No Mobile-Expensify PRs
                }
                return [...baseNewPullRequests]; // App PRs
            }
            return [];
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
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
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
                `${lineBreak}${closedCheckbox}${firebaseVerificationCurrentRelease}` +
                `${lineBreak}${closedCheckbox}${firebaseVerificationPreviousRelease}` +
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
            // cspell:disable-next-line
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return [20, 21, 22, 23, 24]; // Mobile-Expensify PRs
                    }
                    return [...baseNewPullRequests, ...newPullRequests];
                }
                return [];
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
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    // Note: these will be unchecked with a new app version, and that's intentional
                    `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                    `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
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
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return [20, 21, 22]; // Mobile-Expensify PRs
                    }
                    return [...baseNewPullRequests];
                }
                return [];
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
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerificationCurrentRelease}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerificationPreviousRelease}` +
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
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return []; // No Mobile-Expensify PRs
                    }
                    return [...baseNewPullRequests];
                }
                return [];
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
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerificationCurrentRelease}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerificationPreviousRelease}` +
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
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return [20, 22, 24, 25]; // Mobile-Expensify PRs
                    }
                    return [6, 8, 10, 11]; // App PRs
                }
                return [];
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
                isFirebaseChecked: true,
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
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return []; // No Mobile-Expensify PRs
                    }
                    return [6, 8, 10, 11]; // App PRs
                }
                return [];
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
                isFirebaseChecked: true,
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
});
