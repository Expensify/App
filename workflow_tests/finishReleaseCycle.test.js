const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/finishReleaseCycleAssertions');
const mocks = require('./mocks/finishReleaseCycleMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'finishReleaseCycle.yml'),
        dest: '.github/workflows/finishReleaseCycle.yml',
    },
];

describe('test workflow finishReleaseCycle', () => {
    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

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
    const secrets = {
        OS_BOTIFY_TOKEN: 'dummy_token',
        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
        SLACK_WEBHOOK: 'dummy_slack_webhook',
        OS_BOTIFY_APP_ID: 'os_botify_app_id',
        OS_BOTIFY_PRIVATE_KEY: 'os_botify_private_key',
    };
    describe('issue closed', () => {
        describe('issue has StagingDeployCash', () => {
            describe('actor is a team member', () => {
                describe('no deploy blockers', () => {
                    it('production updated, new version created', async () => {
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
                                    labels: [{name: 'StagingDeployCash'}],
                                    number: '1234',
                                },
                            },
                            secrets,
                        );
                        const testMockSteps = {
                            validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                            updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                            updateStaging: mocks.FINISHRELEASECYCLE__UPDATESTAGING__STEP_MOCKS,
                        };
                        const testMockJobs = {
                            createNewPatchVersion: {
                                steps: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('finishReleaseCycle', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });
                        assertions.assertValidateJobExecuted(result, '1234');
                        assertions.assertUpdateProductionJobExecuted(result);
                        assertions.assertCreateNewPatchVersionJobExecuted(result);
                        assertions.assertUpdateStagingJobExecuted(result);
                    });
                });
                describe('deploy blockers', () => {
                    it('production not updated, new version not created, issue reopened', async () => {
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
                                    labels: [{name: 'StagingDeployCash'}],
                                    number: '1234',
                                },
                            },
                            secrets,
                        );
                        const testMockSteps = {
                            validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_BLOCKERS__STEP_MOCKS,
                            updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                            updateStaging: mocks.FINISHRELEASECYCLE__UPDATESTAGING__STEP_MOCKS,
                        };
                        const testMockJobs = {
                            createNewPatchVersion: {
                                steps: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('finishReleaseCycle', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });
                        assertions.assertValidateJobExecuted(result, '1234', true, true, true);
                        assertions.assertUpdateProductionJobExecuted(result, false);
                        assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                        assertions.assertUpdateStagingJobExecuted(result, false);
                    });
                });
            });
            describe('actor is not a team member', () => {
                it('production not updated, new version not created, issue reopened', async () => {
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
                                labels: [{name: 'StagingDeployCash'}],
                                number: '1234',
                            },
                        },
                        secrets,
                    );
                    const testMockSteps = {
                        validate: mocks.FINISHRELEASECYCLE__VALIDATE__NOT_TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                        updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                        updateStaging: mocks.FINISHRELEASECYCLE__UPDATESTAGING__STEP_MOCKS,
                    };
                    const testMockJobs = {
                        createNewPatchVersion: {
                            steps: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                            outputs: {
                                // eslint-disable-next-line no-template-curly-in-string
                                NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                            },
                            runsOn: 'ubuntu-latest',
                        },
                    };
                    const result = await act.runEvent('issues', {
                        workflowFile: path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml'),
                        mockSteps: testMockSteps,
                        actor: 'Dummy Author',
                        logFile: utils.getLogFilePath('finishReleaseCycle', expect.getState().currentTestName),
                        mockJobs: testMockJobs,
                    });
                    assertions.assertValidateJobExecuted(result, '1234', true, false, false);
                    assertions.assertUpdateProductionJobExecuted(result, false);
                    assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                    assertions.assertUpdateStagingJobExecuted(result, false);
                });
            });
        });
        describe('issue does not have StagingDeployCash', () => {
            it('validate job not run', async () => {
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
                            labels: [{name: 'Some'}, {name: 'Other'}, {name: 'Labels'}],
                            number: '1234',
                        },
                    },
                    secrets,
                );
                const testMockSteps = {
                    validate: mocks.FINISHRELEASECYCLE__VALIDATE__TEAM_MEMBER_NO_BLOCKERS__STEP_MOCKS,
                    updateProduction: mocks.FINISHRELEASECYCLE__UPDATEPRODUCTION__STEP_MOCKS,
                    updateStaging: mocks.FINISHRELEASECYCLE__UPDATESTAGING__STEP_MOCKS,
                };
                const testMockJobs = {
                    createNewPatchVersion: {
                        steps: mocks.FINISHRELEASECYCLE__CREATENEWPATCHVERSION__STEP_MOCKS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent('issues', {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'finishReleaseCycle.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('finishReleaseCycle', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });
                assertions.assertValidateJobExecuted(result, '1234', false);
                assertions.assertUpdateProductionJobExecuted(result, false);
                assertions.assertCreateNewPatchVersionJobExecuted(result, false);
                assertions.assertUpdateStagingJobExecuted(result, false);
            });
        });
    });
});
