const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/lockDeploysAssertions');
const mocks = require('./mocks/lockDeploysMocks');
const eAct = require('./utils/ExtendedAct');

let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'actions'),
        dest: '.github/actions',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'libs'),
        dest: '.github/libs',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'scripts'),
        dest: '.github/scripts',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'lockDeploys.yml'),
        dest: '.github/workflows/lockDeploys.yml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testLockDeploysWorkflowRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test workflow lockDeploys', () => {
    describe('issue labeled', () => {
        describe('label is LockCashDeploys', () => {
            describe('issue has StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    test('job triggered, comment left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result);
                    }, 60000);

                    test('one step fails, comment not left in StagingDeployCash, announced failure in Slack', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        testMockSteps.lockStagingDeploys[1] = utils.getMockStep(
                            'Wait for staging deploys to finish',
                            'Waiting for staging deploys to finish',
                            'LOCKSTAGINGDEPLOYS',
                            ['GITHUB_TOKEN'],
                            [],
                            null,
                            null,
                            false,
                        );
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });

                        assertions.assertlockStagingDeploysJobFailedAfterFirstStep(result);
                    }, 60000);
                });

                describe('actor is OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'OSBotify',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });
            });

            describe('issue does not have StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [
                                        {name: 'Some'},
                                        {name: 'Other'},
                                        {name: 'Labels'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });

                describe('actor is OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [
                                        {name: 'Some'},
                                        {name: 'Other'},
                                        {name: 'Labels'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'OSBotify',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });
            });
        });

        describe('label is not LockCashDeploys', () => {
            describe('issue has StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some different label',
                                },
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });

                describe('actor is OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some different label',
                                },
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'OSBotify',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });
            });

            describe('issue does not have StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some other label',
                                },
                                issue: {
                                    labels: [
                                        {name: 'Some'},
                                        {name: 'Other'},
                                        {name: 'Labels'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });

                describe('actor is OSBotify', () => {
                    test('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some other label',
                                },
                                issue: {
                                    labels: [
                                        {name: 'Some'},
                                        {name: 'Other'},
                                        {name: 'Labels'},
                                    ],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'OSBotify',
                            });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    }, 60000);
                });
            });
        });
    });
});
