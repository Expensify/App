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
const mockGetPullRequestsDeployedBetween = jest.fn();
const mockIssuesUpdate = jest.fn();
let mockFetchAllPullRequests: jest.SpyInstance;
let mockGetPullRequestMergerLogin: jest.SpyInstance;

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
                            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                        },
                    }),
                ),
                update: mockIssuesUpdate.mockImplementation((arg: Arguments) =>
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
        paginate: jest.fn().mockImplementation((objectMethod: () => Promise<{data: unknown}>) => objectMethod().then(({data}) => data)),
    } as unknown as InternalOctokit;
    GithubUtils.internalOctokit = moctokit;

    // Mock GitUtils
    GitUtils.getPullRequestsDeployedBetween = mockGetPullRequestsDeployedBetween;

    // Mock internal GithubUtils methods used by generateStagingDeployCashBodyAndAssignees
    mockFetchAllPullRequests = jest.spyOn(GithubUtils, 'fetchAllPullRequests');
    mockGetPullRequestMergerLogin = jest.spyOn(GithubUtils, 'getPullRequestMergerLogin');

    vol.reset();
    vol.fromJSON({
        [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
    });
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetPullRequestsDeployedBetween.mockClear();
    mockIssuesUpdate.mockClear();
    mockFetchAllPullRequests.mockClear();
    mockGetPullRequestMergerLogin.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

const LABELS = {
    STAGING_DEPLOY_CASH: {
        id: 2783847782,
        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/labels/StagingDeployCash`,
        name: CONST.LABELS.STAGING_DEPLOY,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
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

const baseIssueList = [`https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`];
// eslint-disable-next-line max-len
const baseExpectedOutput = (version = '1.0.2-1') =>
    `**Release Version:** \`${version}\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
const openCheckbox = '- [ ] ';
const closedCheckbox = '- [x] ';
const deployerVerificationsHeader = '**Deployer verifications:**';
// eslint-disable-next-line max-len
const timingDashboardVerification =
    'I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.';
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

describe('createOrUpdateStagingDeploy', () => {
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
        mockGetInput.mockImplementation((arg) => {
            if (arg !== 'GITHUB_TOKEN') {
                return;
            }
            return 'fake_token';
        });

        mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
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
            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput()}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
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
                `${lineBreak}${closedCheckbox}${timingDashboardVerification}` +
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
            mockGetInput.mockImplementation((arg) => {
                if (arg !== 'GITHUB_TOKEN') {
                    return;
                }
                return 'fake_token';
            });

            // New pull requests to add to open StagingDeployCash
            const newPullRequests = [9, 10];
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
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
                    };
                }

                return {data: []};
            });

            const result = await run();
            expect(result).toStrictEqual({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                // eslint-disable-next-line @typescript-eslint/naming-convention
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
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(9)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseIssueList.at(1)}${lineBreak}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    // Note: these will be unchecked with a new app version, and that's intentional
                    `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
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
            mockGetInput.mockImplementation((arg) => {
                if (arg !== 'GITHUB_TOKEN') {
                    return;
                }
                return 'fake_token';
            });
            mockGetPullRequestsDeployedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
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
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openStagingDeployCashBefore.number}`,
                // eslint-disable-next-line max-len
                body:
                    `${baseExpectedOutput('1.0.2-1')}` +
                    `${openCheckbox}${basePRList.at(5)}` +
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
                    `${lineBreak}${closedCheckbox}${firebaseVerificationCurrentRelease}` +
                    `${lineBreak}${closedCheckbox}${firebaseVerificationPreviousRelease}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });
    });

    test('PRs that were cherry-picked to previous checklist should be filtered out from new checklist PRs', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.3-0'}),
        });
        mockGetInput.mockImplementation((arg) => {
            if (arg !== 'GITHUB_TOKEN') {
                return;
            }
            return 'fake_token';
        });

        // Mock the response from GitUtils to include value PRs and some which were cherry-picked to prior release (9, 11)
        mockGetPullRequestsDeployedBetween.mockResolvedValue([9, 10, 11, 12]);

        // Mock the previous checklist data directly, including the PRs we want to filter out (9, 11)
        const mockGetStagingDeployCashData = jest.spyOn(GithubUtils, 'getStagingDeployCashData');
        // @ts-expect-error this is a simplified mock implementation
        mockGetStagingDeployCashData.mockImplementation((issue) => {
            if (issue.number === 29) {
                return {
                    title: 'Previous Checklist',
                    url: 'url1',
                    number: 29,
                    labels: [LABELS.STAGING_DEPLOY_CASH],
                    PRList: [
                        {url: 'url6', number: 6, isVerified: true},
                        {url: 'url7', number: 7, isVerified: true},
                        {url: 'url8', number: 8, isVerified: true},
                        {url: 'url9', number: 9, isVerified: true},
                        {url: 'url11', number: 11, isVerified: true},
                    ],
                    deployBlockers: [],
                    internalQAPRList: [],
                    isTimingDashboardChecked: true,
                    isFirebaseChecked: true,
                    isGHStatusChecked: true,
                    version: '1.0.2-1',
                    tag: '1.0.2-1-staging',
                };
            }
            // Mock response for the current checklist
            if (issue.number === 30) {
                return {
                    title: 'Current Checklist',
                    url: 'url2',
                    number: 30,
                    labels: [LABELS.STAGING_DEPLOY_CASH],
                    PRList: [
                        {url: 'url9', number: 9, isVerified: false},
                        {url: 'url10', number: 10, isVerified: false},
                        {url: 'url11', number: 11, isVerified: false},
                        {url: 'url12', number: 12, isVerified: false},
                    ],
                    deployBlockers: [],
                    internalQAPRList: [],
                    isTimingDashboardChecked: false,
                    isFirebaseChecked: false,
                    isGHStatusChecked: false,
                    version: '1.0.3-1',
                    tag: '1.0.3-1-staging',
                };
            }
            return {PRList: [], deployBlockers: [], internalQAPRList: []};
        });

        // Mock the listIssues response to provide the current and previous checklists
        const openChecklistForFiltering = {number: 30, state: 'open', labels: [LABELS.STAGING_DEPLOY_CASH]};
        const previousChecklistForFiltering = {number: 29, state: 'closed', labels: [LABELS.STAGING_DEPLOY_CASH]};

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mockListIssues.mockImplementation((_args: Arguments) => {
            return {data: [openChecklistForFiltering, previousChecklistForFiltering]};
        });

        // Run the createOrUpdateStagingDeploy function
        const consoleSpy = jest.spyOn(console, 'info');
        await run();

        // Verify that the previously cherry-picked PRs are filtered out from the current checklist (9, 11)
        // Use type assertion to assure TypeScript call[0] is a string
        const finalLogCall = consoleSpy.mock.calls.find((call) => (call[0] as string)?.startsWith('Created final list of PRs for current checklist:'));
        expect(finalLogCall?.[0]).toBe('Created final list of PRs for current checklist: [10,12]');

        // Restore mocks
        mockGetStagingDeployCashData.mockRestore();
        consoleSpy.mockRestore();
    });
});
