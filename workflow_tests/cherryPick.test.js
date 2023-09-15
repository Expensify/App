const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/cherryPickAssertions');
const mocks = require('./mocks/cherryPickMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'cherryPick.yml'),
        dest: '.github/workflows/cherryPick.yml',
    },
];

describe('test workflow cherryPick', () => {
    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testCherryPickWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('manual workflow dispatch', () => {
        const event = 'workflow_dispatch';
        describe('actor is not deployer', () => {
            const actor = 'Dummy Author';
            it('workflow ends after validate job', async () => {
                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    null,
                    {
                        OS_BOTIFY_TOKEN: 'dummy_token',
                        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        SLACK_WEBHOOK: 'dummy_slack_webhook',
                    },
                    'dummy_github_token',
                    null,
                    {
                        PULL_REQUEST_NUMBER: '1234',
                    },
                );
                const testMockSteps = {
                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS,
                    cherryPick: mocks.getCherryPickMockSteps(true, false),
                };
                const testMockJobs = {
                    createNewVersion: {
                        steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });

                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result, false);
                assertions.assertCherryPickJobExecuted(result, actor, '1234', false);
            });
        });
        describe('actor is OSBotify', () => {
            const actor = 'OSBotify';
            const mergeConflicts = false;
            const versionsMatch = true;
            it('behaviour is the same as with actor being the deployer', async () => {
                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS,
                    cherryPick: mocks.getCherryPickMockSteps(versionsMatch, mergeConflicts),
                };
                const testMockJobs = {
                    createNewVersion: {
                        steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                };
                act = utils.setUpActParams(
                    act,
                    event,
                    null,
                    {
                        OS_BOTIFY_TOKEN: 'dummy_token',
                        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        SLACK_WEBHOOK: 'dummy_slack_webhook',
                    },
                    'dummy_github_token',
                    null,
                    {
                        PULL_REQUEST_NUMBER: '1234',
                    },
                );
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });

                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result);
                assertions.assertCherryPickJobExecuted(result, actor, '1234', true);
            });
        });
        describe('actor is a deployer', () => {
            const actor = 'Dummy Author';
            describe('no merge conflicts', () => {
                const mergeConflicts = false;
                describe('version match', () => {
                    const versionsMatch = true;
                    it('workflow executes, PR approved and merged automatically', async () => {
                        const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        const testMockSteps = {
                            validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                        };
                        testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, mergeConflicts);
                        const testMockJobs = {
                            createNewVersion: {
                                steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        act = utils.setUpActParams(
                            act,
                            event,
                            null,
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                            'dummy_github_token',
                            null,
                            {
                                PULL_REQUEST_NUMBER: '1234',
                            },
                        );
                        const result = await act.runEvent(event, {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                            mockSteps: testMockSteps,
                            actor,
                            logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });

                        assertions.assertValidateActorJobExecuted(result);
                        assertions.assertCreateNewVersionJobExecuted(result);
                        assertions.assertCherryPickJobExecuted(result, actor, '1234', true);
                    });
                });
                describe('version does not match', () => {
                    const versionsMatch = false;
                    it('workflow executes, PR auto-assigned and commented, approved and merged automatically', async () => {
                        const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        const testMockSteps = {
                            validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                        };
                        testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, mergeConflicts);
                        const testMockJobs = {
                            createNewVersion: {
                                steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        act = utils.setUpActParams(
                            act,
                            event,
                            null,
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                            'dummy_github_token',
                            null,
                            {
                                PULL_REQUEST_NUMBER: '1234',
                            },
                        );
                        const result = await act.runEvent(event, {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                            mockSteps: testMockSteps,
                            actor,
                            logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });

                        assertions.assertValidateActorJobExecuted(result);
                        assertions.assertCreateNewVersionJobExecuted(result);
                        assertions.assertCherryPickJobExecuted(result, actor, '1234', true);
                    });
                });
            });
            describe('merge conflicts', () => {
                const mergeConflicts = true;
                describe('version match', () => {
                    const versionsMatch = true;
                    it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                        const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        const testMockSteps = {
                            validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                        };
                        testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, mergeConflicts);
                        const testMockJobs = {
                            createNewVersion: {
                                steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        act = utils.setUpActParams(
                            act,
                            event,
                            null,
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                            'dummy_github_token',
                            null,
                            {
                                PULL_REQUEST_NUMBER: '1234',
                            },
                        );
                        const result = await act.runEvent(event, {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                            mockSteps: testMockSteps,
                            actor,
                            logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });

                        assertions.assertValidateActorJobExecuted(result);
                        assertions.assertCreateNewVersionJobExecuted(result);
                        assertions.assertCherryPickJobExecuted(result, actor, '1234', true, true);
                    });
                });
                describe('version does not match', () => {
                    const versionsMatch = false;
                    it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                        const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                        let act = new eAct.ExtendedAct(repoPath, workflowPath);
                        const testMockSteps = {
                            validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                        };
                        testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, mergeConflicts);
                        const testMockJobs = {
                            createNewVersion: {
                                steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                outputs: {
                                    // eslint-disable-next-line no-template-curly-in-string
                                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                                },
                                runsOn: 'ubuntu-latest',
                            },
                        };
                        act = utils.setUpActParams(
                            act,
                            event,
                            null,
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                            'dummy_github_token',
                            null,
                            {
                                PULL_REQUEST_NUMBER: '1234',
                            },
                        );
                        const result = await act.runEvent(event, {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                            mockSteps: testMockSteps,
                            actor,
                            logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                            mockJobs: testMockJobs,
                        });

                        assertions.assertValidateActorJobExecuted(result);
                        assertions.assertCreateNewVersionJobExecuted(result);
                        assertions.assertCherryPickJobExecuted(result, actor, '1234', true, true);
                    });
                });
            });
        });
    });
    describe('automatic trigger', () => {
        const event = 'pull_request';
        it('workflow does not execute', async () => {
            const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                event,
                null,
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                    SLACK_WEBHOOK: 'dummy_slack_webhook',
                },
                'dummy_github_token',
                null,
                {
                    PULL_REQUEST_NUMBER: '1234',
                },
            );
            const testMockSteps = {
                validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                cherryPick: mocks.getCherryPickMockSteps(true, false),
            };
            const testMockJobs = {
                createNewVersion: {
                    steps: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'cherryPick.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Author',
                logFile: utils.getLogFilePath('cherryPick', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });

            assertions.assertValidateActorJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertCherryPickJobExecuted(result, 'Dummy Author', '1234', false);
        });
    });
});
