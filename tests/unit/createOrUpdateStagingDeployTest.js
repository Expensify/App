/**
 * @jest-environment node
 */
const core = require('@actions/core');
const moment = require('moment');
const GitUtils = require('../../.github/libs/GitUtils');
const GithubUtils = require('../../.github/libs/GithubUtils');
const run = require('../../.github/actions/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy');

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();
const mockGetPullRequestsMergedBetween = jest.fn();

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;

    // Mock octokit module
    const mocktokit = {
        issues: {
            create: jest.fn().mockImplementation(arg => Promise.resolve({
                data: {
                    ...arg,
                    html_url: 'https://github.com/Expensify/Expensify.cash/issues/29',
                },
            })),
            update: jest.fn().mockImplementation(arg => Promise.resolve({
                data: {
                    ...arg,
                    html_url: `https://github.com/Expensify/Expensify.cash/issues/${arg.issue_number}`,
                },
            })),
            listForRepo: mockListIssues,
        },
        pulls: {
            // Static mock for pulls.list (only used to filter out automated PRs, and that functionality is covered
            // in the test for GithubUtils.generateStagingDeployCashBody
            list: jest.fn().mockResolvedValue([]),
        },
    };
    GithubUtils.octokitInternal = mocktokit;

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
        url: 'https://api.github.com/repos/Expensify/Expensify.cash/labels/StagingDeployCash',
        name: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: 'https://api.github.com/repos/Expensify/Expensify.cash/labels/DeployBlockerCash',
        name: GithubUtils.DEPLOY_BLOCKER_CASH_LABEL,
        color: '000000',
        default: false,
        description: 'This issue or pull request should block deployment',
    },
};

describe('createOrUpdateStagingDeployCash', () => {
    const closedStagingDeployCash = {
        url: 'https://api.github.com/repos/Expensify/Expensify.cash/issues/28',
        title: 'Test StagingDeployCash',
        number: 28,
        labels: [LABELS.STAGING_DEPLOY_CASH],
        html_url: 'https://github.com/Expensify/Expensify.cash/issues/29',
        // eslint-disable-next-line max-len
        body: '**Release Version:** `1.0.1-0`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/1\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/2\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/3\r\n\r\n**Deploy Blockers:**\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/1\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/4\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/5\r\n\r\ncc @Expensify/applauseleads\r\n',
        state: 'closed',
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
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                title: `Deploy Checklist: Expensify.cash ${moment().format('YYYY-MM-DD')}`,
                labels: [GithubUtils.STAGING_DEPLOY_CASH_LABEL],
                html_url: 'https://github.com/Expensify/Expensify.cash/issues/29',
                assignees: [GithubUtils.APPLAUSE_BOT],
                // eslint-disable-next-line max-len
                body: '**Release Version:** `1.0.2-1`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/7\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/8\r\n\r\ncc @Expensify/applauseleads\r\n',
            });
        });
    });

    describe('updates existing issue when there is one open', () => {
        const openStagingDeployCashBefore = {
            url: 'https://api.github.com/repos/Expensify/Expensify.cash/issues/29',
            title: 'Test StagingDeployCash',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],
            // eslint-disable-next-line max-len
            body: '**Release Version:** `1.0.2-1`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/7\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/8\r\n\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/9\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/10\r\n\r\ncc @Expensify/applauseleads\r\n',
            state: 'open',
        };

        const currentOpenDeployBlockers = [
            {
                url: 'https://github.com/Expensify/Expensify.cash/pull/6',
                number: 6,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                url: 'https://github.com/Expensify/Expensify.cash/issues/9',
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                url: 'https://github.com/Expensify/Expensify.cash/issues/10',
                number: 10,
                state: 'open',
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
                            ...currentOpenDeployBlockers,
                            {
                                url: 'https://github.com/Expensify/Expensify.cash/issues/11', // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                url: 'https://github.com/Expensify/Expensify.cash/issues/12', // New
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
                    repo: GithubUtils.EXPENSIFY_CASH_REPO,
                    issue_number: openStagingDeployCashBefore.number,
                    // eslint-disable-next-line max-len
                    html_url: `https://github.com/Expensify/Expensify.cash/issues/${openStagingDeployCashBefore.number}`,
                    // eslint-disable-next-line max-len
                    body: `**Release Version:** \`1.0.2-2\`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/7\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/8\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/${newPullRequests[0]}\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/${newPullRequests[1]}\r\n\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/9\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/10\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/11\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/12\r\n\r\ncc @Expensify/applauseleads\r\n`,
                });
            });
        });

        test('without NPM_VERSION input, just a new deploy blocker', () => {
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
                            ...currentOpenDeployBlockers,
                            {
                                url: 'https://github.com/Expensify/Expensify.cash/issues/11', // New
                                number: 11,
                                state: 'open',
                                labels: [LABELS.DEPLOY_BLOCKER_CASH],
                            },
                            {
                                url: 'https://github.com/Expensify/Expensify.cash/issues/12', // New
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
                    repo: GithubUtils.EXPENSIFY_CASH_REPO,
                    issue_number: openStagingDeployCashBefore.number,
                    // eslint-disable-next-line max-len
                    html_url: `https://github.com/Expensify/Expensify.cash/issues/${openStagingDeployCashBefore.number}`,
                    // eslint-disable-next-line max-len
                    body: '**Release Version:** `1.0.2-2`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/7\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/8\r\n\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/6\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/9\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/10\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/11\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/12\r\n\r\ncc @Expensify/applauseleads\r\n',
                });
            });
        });
    });
});
