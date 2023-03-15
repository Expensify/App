const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/finishReleaseCycleAssertions');
const mocks = require('./mocks/finishReleaseCycleMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'finishReleaseCycle.yml'),
        dest: '.github/workflows/finishReleaseCycle.yml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testFinishReleaseCycleWorkflowRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test workflow finishReleaseCycle', () => {
    describe('issue closed', () => {
        describe('issue has StagingDeployCash', () => {
            describe('actor is a team member', () => {
                describe('no deploy blockers', () => {
                    test('production updated, new version created, new StagingDeployCash created', async () => {
                        const repoPath = mockGithub.repo.getPath('testFinishReleaseCycleWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'closed',
                                type: 'closed',
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                    number: '1234',
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        const testMockSteps = {
                            validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                            updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                            createNewPatchVersion: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                            createNewStagingDeployCash: mocks.FINISHRELEASECYCLE__CREATENEWSTAGINGDEPLOYCASH__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });
                        assertions.assertValidateJobExecuted(result, 'Dummy Author', '1234');
                        assertions.assertUpdateProductionJobExecuted(result);
                        assertions.assertCreateNewPatchVersionJobExecuted(result);
                        assertions.assertCreateNewStagingDeployCashJobExecuted(result, '1.2.3');
                    }, 60000);
                    describe('createNewStagingDeployCash fails', () => {
                        test('failure announced on Slack', async () => {
                            const repoPath = mockGithub.repo.getPath('testFinishReleaseCycleWorkflowRepo') || '';
                            const workflowPath = path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml');
                            let act = new eAct.ExtendedAct(repoPath, workflowPath);
                            act = utils.setUpActParams(
                                act,
                                'issues',
                                {
                                    action: 'closed',
                                    type: 'closed',
                                    issue: {
                                        labels: [
                                            {name: 'StagingDeployCash'},
                                        ],
                                        number: '1234',
                                    },
                                },
                                {
                                    OS_BOTIFY_TOKEN: 'dummy_token',
                                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                    SLACK_WEBHOOK: 'dummy_slack_webhook',
                                },
                            );
                            const testMockSteps = {
                                validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                                updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                                createNewPatchVersion: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                                createNewStagingDeployCash: mocks.FINISHRELEASECYCLE__CREATENEWSTAGINGDEPLOYCASH__STEP_MOCKS,
                            };
                            testMockSteps.createNewStagingDeployCash[2] = utils.getMockStep(
                                'Create new StagingDeployCash',
                                'Creating new StagingDeployCash',
                                'CREATENEWSTAGINGDEPLOYCASH',
                                ['GITHUB_TOKEN', 'NPM_VERSION'],
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
                            assertions.assertValidateJobExecuted(result, 'Dummy Author', '1234');
                            assertions.assertUpdateProductionJobExecuted(result);
                            assertions.assertCreateNewPatchVersionJobExecuted(result);
                            assertions.assertCreateNewStagingDeployCashJobExecuted(result, '1.2.3', true, false);
                        }, 60000);
                    });
                });
                describe('deploy blockers', () => {
                    test('production not updated, new version not created, new StagingDeployCash not created, issue reopened', async () => {
                        const repoPath = mockGithub.repo.getPath('testFinishReleaseCycleWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            'issues',
                            {
                                action: 'closed',
                                type: 'closed',
                                issue: {
                                    labels: [
                                        {name: 'StagingDeployCash'},
                                    ],
                                    number: '1234',
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        const testMockSteps = {
                            validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_BLOCKERS__STEP_MOCKS,
                            updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                            createNewPatchVersion: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                            createNewStagingDeployCash: mocks.FINISHRELEASECYCLE__CREATENEWSTAGINGDEPLOYCASH__STEP_MOCKS,
                        };
                        const result = await act
                            .runEvent('issues', {
                                workflowFile: path.join(repoPath, '.github', 'workflows'),
                                mockSteps: testMockSteps,
                                actor: 'Dummy Author',
                            });
                        assertions.assertValidateJobExecuted(result, 'Dummy Author', '1234', true, true, true);
                        assertions.assertUpdateProductionJobExecuted(result, false);
                        assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                        assertions.assertCreateNewStagingDeployCashJobExecuted(result, '1.2.3', false);
                    }, 60000);
                });
            });
            describe('actor is not a team member', () => {
                test('production not updated, new version not created, new StagingDeployCash not created, issue reopened', async () => {
                    const repoPath = mockGithub.repo.getPath('testFinishReleaseCycleWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'issues',
                        {
                            action: 'closed',
                            type: 'closed',
                            issue: {
                                labels: [
                                    {name: 'StagingDeployCash'},
                                ],
                                number: '1234',
                            },
                        },
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                        },
                    );
                    const testMockSteps = {
                        validate: mocks.FINISHRELEASECYCLE__VALIDATE__NOT_TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                        updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                        createNewPatchVersion: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                        createNewStagingDeployCash: mocks.FINISHRELEASECYCLE__CREATENEWSTAGINGDEPLOYCASH__STEP_MOCKS,
                    };
                    const result = await act
                        .runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                        });
                    assertions.assertValidateJobExecuted(result, 'Dummy Author', '1234', true, false, false);
                    assertions.assertUpdateProductionJobExecuted(result, false);
                    assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                    assertions.assertCreateNewStagingDeployCashJobExecuted(result, '1.2.3', false);
                }, 60000);
            });
        });
        describe('issue does not have StagingDeployCash', () => {
            test('validate job not run', async () => {
                const repoPath = mockGithub.repo.getPath('testFinishReleaseCycleWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'issues',
                    {
                        action: 'closed',
                        type: 'closed',
                        issue: {
                            labels: [
                                {name: 'Some'},
                                {name: 'Other'},
                                {name: 'Labels'},
                            ],
                            number: '1234',
                        },
                    },
                    {
                        OS_BOTIFY_TOKEN: 'dummy_token',
                        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        SLACK_WEBHOOK: 'dummy_slack_webhook',
                    },
                );
                const testMockSteps = {
                    validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                    updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                    createNewPatchVersion: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                    createNewStagingDeployCash: mocks.FINISHRELEASECYCLE__CREATENEWSTAGINGDEPLOYCASH__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('issues', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'Dummy Author',
                    });
                assertions.assertValidateJobExecuted(result, 'Dummy Author', '1234', false);
                assertions.assertUpdateProductionJobExecuted(result, false);
                assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                assertions.assertCreateNewStagingDeployCashJobExecuted(result, '1.2.3', false);
            }, 60000);
        });
    });
});
