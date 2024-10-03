/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/naming-convention */
import * as fns from 'date-fns';
import {vol} from 'memfs';
import path from 'path';
import run from '@github/actions/javascript/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy';
import CONST from '@github/libs/CONST';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

type Arguments = {
    issue_number?: number;
    labels?: string;
};

const PATH_TO_PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

jest.mock('fs');
const mockGetInput = jest.fn();
const mockListIssues = jest.fn();
const mockGetPullRequestsMergedBetween = jest.fn();

beforeAll(() => {
    // Mock core module
    jest.mock('@actions/core', () => ({
        getInput: mockGetInput,
    }));

    // Mock octokit module
    const moctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation((arg: Arguments) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: 'https://github.com/Expensify/App/issues/29',
                        },
                    }),
                ),
                update: jest.fn().mockImplementation((arg: Arguments) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: `https://github.com/Expensify/App/issues/${arg.issue_number}`,
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
        paginate: jest.fn().mockImplementation((objectMethod: () => Promise<{data: unknown}>) => objectMethod().then(({data}) => data)),
    } as unknown as InternalOctokit;
    GithubUtils.internalOctokit = moctokit;

    // Mock GitUtils
    GitUtils.getPullRequestsMergedBetween = mockGetPullRequestsMergedBetween;

    vol.reset();
    vol.fromJSON({
        [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
    });
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetPullRequestsMergedBetween.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

const LABELS = {
    STAGING_DEPLOY_CASH: {
        id: 2783847782,
        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
        url: 'https://api.github.com/repos/Expensify/App/labels/StagingDeployCash',
        name: CONST.LABELS.STAGING_DEPLOY,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: 'https://api.github.com/repos/Expensify/App/labels/DeployBlockerCash',
        name: CONST.LABELS.DEPLOY_BLOCKER,
        color: '000000',
        default: false,
        description: 'This issue or pull request should block deployment',
    },
};

const basePRList = [
    'https://github.com/Expensify/App/pull/1',
    'https://github.com/Expensify/App/pull/2',
    'https://github.com/Expensify/App/pull/3',
    'https://github.com/Expensify/App/pull/4',
    'https://github.com/Expensify/App/pull/5',
    'https://github.com/Expensify/App/pull/6',
    'https://github.com/Expensify/App/pull/7',
    'https://github.com/Expensify/App/pull/8',
    'https://github.com/Expensify/App/pull/9',
    'https://github.com/Expensify/App/pull/10',
];

const baseIssueList = ['https://github.com/Expensify/App/issues/11', 'https://github.com/Expensify/App/issues/12'];
// eslint-disable-next-line max-len
const baseExpectedOutput = (tag = '1.0.2-1') =>
    `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
const openCheckbox = '- [ ] ';
const closedCheckbox = '- [x] ';
const deployerVerificationsHeader = '**Deployer verifications:**';
// eslint-disable-next-line max-len
const timingDashboardVerification =
    'I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.';
// eslint-disable-next-line max-len
const firebaseVerification =
    'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
// eslint-disable-next-line max-len
const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';
const ccApplauseLeads = 'cc @Expensify/applauseleads\r\n';
const deployBlockerHeader = '**Deploy Blockers:**';
const lineBreak = '\r\n';
const lineBreakDouble = '\r\n\r\n';

describe('createOrUpdateStagingDeployCash', () => {
    const closedStagingDeployCash = {
        url: 'https://api.github.com/repos/Expensify/App/issues/28',
        title: 'Test StagingDeployCash',
        number: 28,
        labels: [LABELS.STAGING_DEPLOY_CASH],
        html_url: 'https://github.com/Expensify/App/issues/29',
        // eslint-disable-next-line max-len
        body:
            `${baseExpectedOutput('1.0.1-0')}${closedCheckbox}${basePRList.at(0)}` +
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
        mockGetInput.mockImplementation((arg) => {
            if (arg !== 'GITHUB_TOKEN') {
                return;
            }
            return 'fake_token';
        });

        mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
            if (fromRef === '1.0.1-0' && toRef === '1.0.2-1') {
                return [...baseNewPullRequests];
            }
            return [];
        });

        mockListIssues.mockImplementation((args: Arguments) => {
            if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                return {data: [closedStagingDeployCash]};
            }

            return {data: []};
        });

        const result = await run();
        expect(result).toStrictEqual({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            title: `Deploy Checklist: New Expensify ${fns.format(new Date(), 'yyyy-MM-dd')}`,
            labels: [CONST.LABELS.STAGING_DEPLOY],
            html_url: 'https://github.com/Expensify/App/issues/29',
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput()}${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                `${lineBreak}${openCheckbox}${firebaseVerification}` +
                `${lineBreak}${openCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
        });
    });

    describe('updates existing issue when there is one open', () => {
        const openStagingDeployCashBefore = {
            url: 'https://api.github.com/repos/Expensify/App/issues/29',
            title: 'Test StagingDeployCash',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],
            // eslint-disable-next-line max-len
            body:
                `${baseExpectedOutput()}${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}${deployBlockerHeader}` +
                `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(9)}${lineBreak}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${closedCheckbox}${timingDashboardVerification}` +
                `${lineBreak}${closedCheckbox}${firebaseVerification}` +
                `${lineBreak}${closedCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
            state: 'open',
        };

        const currentDeployBlockers = [
            {
                html_url: 'https://github.com/Expensify/App/pull/6',
                number: 6,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: 'https://github.com/Expensify/App/pull/9',
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: 'https://github.com/Expensify/App/pull/10',
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
            mockGetInput.mockImplementation((arg) => {
                if (arg !== 'GITHUB_TOKEN') {
                    return;
                }
                return 'fake_token';
            });

            // New pull requests to add to open StagingDeployCash
            const newPullRequests = [9, 10];
            mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0' && toRef === '1.0.2-2') {
                    return [...baseNewPullRequests, ...newPullRequests];
                }
                return [];
            });

            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return {data: [openStagingDeployCashBefore, closedStagingDeployCash]};
                }

                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return {
                        data: [
                            ...currentDeployBlockers,
                            {
                                html_url: 'https://github.com/Expensify/App/issues/11', // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                html_url: 'https://github.com/Expensify/App/issues/12', // New
                                number: 12,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                        ],
                    };
                }

                return {data: []};
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openStagingDeployCashBefore.number,
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                html_url: `https://github.com/Expensify/App/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-2')}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(9)}${lineBreak}` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(1)}${lineBreak}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    // Note: these will be unchecked with a new app version, and that's intentional
                    `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                    `${lineBreak}${openCheckbox}${firebaseVerification}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });

        test('without NPM_VERSION input, just a new deploy blocker', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });
            mockGetInput.mockImplementation((arg) => {
                if (arg !== 'GITHUB_TOKEN') {
                    return;
                }
                return 'fake_token';
            });
            mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0' && toRef === '1.0.2-1') {
                    return [...baseNewPullRequests];
                }
                return [];
            });
            mockListIssues.mockImplementation((args: Arguments) => {
                if (args.labels === CONST.LABELS.STAGING_DEPLOY) {
                    return {data: [openStagingDeployCashBefore, closedStagingDeployCash]};
                }

                if (args.labels === CONST.LABELS.DEPLOY_BLOCKER) {
                    return {
                        data: [
                            // Suppose the first deploy blocker is demoted, it should not be removed from the checklist and instead just be checked off
                            ...currentDeployBlockers.slice(1),
                            {
                                html_url: 'https://github.com/Expensify/App/issues/11', // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                html_url: 'https://github.com/Expensify/App/issues/12', // New
                                number: 12,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                        ],
                    };
                }

                return {data: []};
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openStagingDeployCashBefore.number,
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                html_url: `https://github.com/Expensify/App/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-1')}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(1)}${lineBreak}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${timingDashboardVerification}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerification}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });
    });
});
