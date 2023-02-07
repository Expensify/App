/**
 * @jest-environment node
 */
const core = require('@actions/core');
const moment = require('moment');
const GitUtils = require('../../.github/libs/GitUtils');
const GithubUtils = require('../../.github/libs/GithubUtils');
const run = require('../../.github/actions/javascript/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy');

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();
const mockGetPullRequestsMergedBetween = jest.fn();

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;

    // Mock octokit module
    const moctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation(arg => Promise.resolve({
                    data: {
                        ...arg,
                        html_url: 'https://github.com/Expensify/App/issues/29',
                    },
                })),
                update: jest.fn().mockImplementation(arg => Promise.resolve({
                    data: {
                        ...arg,
                        html_url: `https://github.com/Expensify/App/issues/${arg.issue_number}`,
                    },
                })),
                listForRepo: mockListIssues,
            },
            pulls: {
                // Static mock for pulls.list (only used to filter out automated PRs, and that functionality is covered
                // in the test for GithubUtils.generateStagingDeployCashBody
                list: jest.fn().mockResolvedValue([]),
            },
        },
        paginate: jest.fn().mockImplementation(objectMethod => objectMethod().then(({data}) => data)),
    };
    GithubUtils.internalOctokit = moctokit;

    // Mock GitUtils
    GitUtils.getPullRequestsMergedBetween = mockGetPullRequestsMergedBetween;
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
        name: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: 'https://api.github.com/repos/Expensify/App/labels/DeployBlockerCash',
        name: GithubUtils.DEPLOY_BLOCKER_CASH_LABEL,
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
    'https://github.com/Expensify/App/issues/11',
    'https://github.com/Expensify/App/issues/12',
];

const baseIssueList = [
    'https://github.com/Expensify/App/issues/11',
    'https://github.com/Expensify/App/issues/12',
];
// eslint-disable-next-line max-len
const baseExpectedOutput = (tag = '1.0.2-1') => `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
const openCheckbox = '- [ ] ';
const closedCheckbox = '- [x] ';
const deployerVerificationsHeader = '**Deployer verifications:**';
// eslint-disable-next-line max-len
const timingDashboardVerification = 'I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.';
// eslint-disable-next-line max-len
const firebaseVerification = 'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
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
        body: `${baseExpectedOutput('1.0.1-0')}`
            + `${closedCheckbox}${basePRList[0]}`
            + `${lineBreak}${closedCheckbox}${basePRList[1]}`
            + `${lineBreak}${closedCheckbox}${basePRList[2]}${lineBreak}`
            + `${lineBreakDouble}${deployBlockerHeader}`
            + `${lineBreak}${closedCheckbox}${basePRList[0]}`
            + `${lineBreak}${closedCheckbox}${basePRList[3]}`
            + `${lineBreak}${closedCheckbox}${basePRList[4]}`
            + `${lineBreakDouble}${ccApplauseLeads}`,
    };

    const baseNewPullRequests = ['6', '7', '8'];

    test('creates new issue when there is none open', () => {
        mockGetInput.mockImplementation((arg) => {
            if (arg === 'GITHUB_TOKEN') {
                return 'fake_token';
            }

            if (arg === 'NPM_VERSION') {
                return '1.0.2-1';
            }
        });

        mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
            if (fromRef === '1.0.1-0' && toRef === '1.0.2-1') {
                return [
                    ...baseNewPullRequests,
                ];
            }
            return [];
        });

        mockListIssues.mockImplementation((args) => {
            if (args.labels === GithubUtils.STAGING_DEPLOY_CASH_LABEL) {
                return {data: [closedStagingDeployCash]};
            }

            return {data: []};
        });

        return run().then((result) => {
            expect(result).toStrictEqual({
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.APP_REPO,
                title: `Deploy Checklist: New Expensify ${moment().format('YYYY-MM-DD')}`,
                labels: [GithubUtils.STAGING_DEPLOY_CASH_LABEL],
                html_url: 'https://github.com/Expensify/App/issues/29',
                assignees: [GithubUtils.APPLAUSE_BOT],
                body: `${baseExpectedOutput()}`
                    + `${openCheckbox}${basePRList[5]}`
                    + `${lineBreak}${openCheckbox}${basePRList[6]}`
                    + `${lineBreak}${openCheckbox}${basePRList[7]}${lineBreak}`
                    + `${lineBreakDouble}${deployerVerificationsHeader}`
                    + `${lineBreak}${openCheckbox}${timingDashboardVerification}`
                    + `${lineBreak}${openCheckbox}${firebaseVerification}`
                    + `${lineBreakDouble}${ccApplauseLeads}`,
            });
        });
    });

    describe('updates existing issue when there is one open', () => {
        const openStagingDeployCashBefore = {
            url: 'https://api.github.com/repos/Expensify/App/issues/29',
            title: 'Test StagingDeployCash',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],
            // eslint-disable-next-line max-len
            body: `${baseExpectedOutput()}`
                + `${openCheckbox}${basePRList[5]}`
                + `${lineBreak}${closedCheckbox}${basePRList[6]}`
                + `${lineBreak}${openCheckbox}${basePRList[7]}${lineBreak}`
                + `${lineBreakDouble}${deployBlockerHeader}`
                + `${lineBreak}${openCheckbox}${basePRList[5]}`
                + `${lineBreak}${openCheckbox}${basePRList[8]}`
                + `${lineBreak}${closedCheckbox}${basePRList[9]}${lineBreak}`
                + `${lineBreakDouble}${deployerVerificationsHeader}`
                + `${lineBreak}${closedCheckbox}${timingDashboardVerification}`
                + `${lineBreak}${closedCheckbox}${firebaseVerification}`
                + `${lineBreakDouble}${ccApplauseLeads}`,
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
                html_url: 'https://github.com/Expensify/App/issues/9',
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: 'https://github.com/Expensify/App/issues/10',
                number: 10,
                state: 'closed',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
        ];

        test('with NPM_VERSION input, pull requests, and deploy blockers', () => {
            mockGetInput.mockImplementation((arg) => {
                if (arg === 'GITHUB_TOKEN') {
                    return 'fake_token';
                }

                if (arg === 'NPM_VERSION') {
                    return '1.0.2-2';
                }
            });

            // New pull requests to add to open StagingDeployCash
            const newPullRequests = ['9', '10'];
            mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0' && toRef === '1.0.2-2') {
                    return [
                        ...baseNewPullRequests,
                        ...newPullRequests,
                    ];
                }
                return [];
            });

            mockListIssues.mockImplementation((args) => {
                if (args.labels === GithubUtils.STAGING_DEPLOY_CASH_LABEL) {
                    return {data: [openStagingDeployCashBefore, closedStagingDeployCash]};
                }

                if (args.labels === GithubUtils.DEPLOY_BLOCKER_CASH_LABEL) {
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

            return run().then((result) => {
                expect(result).toStrictEqual({
                    owner: GithubUtils.GITHUB_OWNER,
                    repo: GithubUtils.APP_REPO,
                    issue_number: openStagingDeployCashBefore.number,
                    // eslint-disable-next-line max-len
                    html_url: `https://github.com/Expensify/App/issues/${openStagingDeployCashBefore.number}`,
                    // eslint-disable-next-line max-len
                    body: `${baseExpectedOutput('1.0.2-2')}`
                        + `${openCheckbox}${basePRList[5]}`
                        + `${lineBreak}${closedCheckbox}${basePRList[6]}`
                        + `${lineBreak}${openCheckbox}${basePRList[7]}`
                        + `${lineBreak}${openCheckbox}${basePRList[8]}`
                        + `${lineBreak}${openCheckbox}${basePRList[9]}${lineBreak}`
                        + `${lineBreakDouble}${deployBlockerHeader}`
                        + `${lineBreak}${openCheckbox}${basePRList[5]}`
                        + `${lineBreak}${openCheckbox}${basePRList[8]}`
                        + `${lineBreak}${closedCheckbox}${basePRList[9]}`
                        + `${lineBreak}${openCheckbox}${basePRList[10]}`
                        + `${lineBreak}${openCheckbox}${basePRList[11]}${lineBreak}`
                        + `${lineBreakDouble}${deployerVerificationsHeader}`

                        // Note: these will be unchecked with a new app version, and that's intentional
                        + `${lineBreak}${openCheckbox}${timingDashboardVerification}`
                        + `${lineBreak}${openCheckbox}${firebaseVerification}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                });
            });
        });

        test('without NPM_VERSION input, just a new deploy blocker', () => {
            mockGetInput.mockImplementation((arg) => {
                if (arg !== 'GITHUB_TOKEN') {
                    return;
                }
                return 'fake_token';
            });
            mockGetPullRequestsMergedBetween.mockImplementation((fromRef, toRef) => {
                if (fromRef === '1.0.1-0' && toRef === '1.0.2-2') {
                    return [
                        ...baseNewPullRequests,
                    ];
                }
                return [];
            });
            mockListIssues.mockImplementation((args) => {
                if (args.labels === GithubUtils.STAGING_DEPLOY_CASH_LABEL) {
                    return {data: [openStagingDeployCashBefore, closedStagingDeployCash]};
                }

                if (args.labels === GithubUtils.DEPLOY_BLOCKER_CASH_LABEL) {
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

            return run().then((result) => {
                expect(result).toStrictEqual({
                    owner: GithubUtils.GITHUB_OWNER,
                    repo: GithubUtils.APP_REPO,
                    issue_number: openStagingDeployCashBefore.number,
                    // eslint-disable-next-line max-len
                    html_url: `https://github.com/Expensify/App/issues/${openStagingDeployCashBefore.number}`,
                    // eslint-disable-next-line max-len
                    body: `${baseExpectedOutput('1.0.2-1')}`
                        + `${openCheckbox}${basePRList[5]}`
                        + `${lineBreak}${closedCheckbox}${basePRList[6]}`
                        + `${lineBreak}${openCheckbox}${basePRList[7]}${lineBreak}`
                        + `${lineBreakDouble}${deployBlockerHeader}`
                        + `${lineBreak}${openCheckbox}${basePRList[5]}`
                        + `${lineBreak}${openCheckbox}${basePRList[8]}`
                        + `${lineBreak}${closedCheckbox}${basePRList[9]}`
                        + `${lineBreak}${openCheckbox}${baseIssueList[0]}`
                        + `${lineBreak}${openCheckbox}${baseIssueList[1]}${lineBreak}`
                        + `${lineBreakDouble}${deployerVerificationsHeader}`
                        + `${lineBreak}${closedCheckbox}${timingDashboardVerification}`
                        + `${lineBreak}${closedCheckbox}${firebaseVerification}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                });
            });
        });
    });
});
