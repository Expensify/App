const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/createNewVersionAssertions');
const mocks = require('./mocks/createNewVersionMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000); // 90 sec
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'createNewVersion.yml'),
        dest: '.github/workflows/createNewVersion.yml',
    },
];

describe('test workflow createNewVersion', () => {
    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testCreateNewVersionWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });

    describe('event is workflow_call', () => {
        const event = 'workflow_call';
        const inputs = {
            SEMVER_LEVEL: 'BUILD',
        };
        const secrets = {
            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            OS_BOTIFY_COMMIT_TOKEN: 'dummy_osbotify_commit_token',
            SLACK_WEBHOOK: 'dummy_webhook',
            OS_BOTIFY_APP_ID: 'os_botify_app_id',
            OS_BOTIFY_PRIVATE_KEY: 'os_botify_private_key',
        };
        const githubToken = 'dummy_github_token';

        describe('actor is admin', () => {
            const validateActorMockSteps = mocks.CREATENEWVERSION__VALIDATEACTOR__ADMIN__STEP_MOCKS;
            it('executes full workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testCreateNewVersionWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {createNewVersion: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: validateActorMockSteps,
                    createNewVersion: mocks.CREATENEWVERSION__CREATENEWVERSION__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('createNewVersion', expect.getState().currentTestName),
                });
                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result);
            });
        });

        describe('actor is writer', () => {
            const validateActorMockSteps = mocks.CREATENEWVERSION__VALIDATEACTOR__WRITER__STEP_MOCKS;
            it('executes full workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testCreateNewVersionWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {createNewVersion: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: validateActorMockSteps,
                    createNewVersion: mocks.CREATENEWVERSION__CREATENEWVERSION__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('createNewVersion', expect.getState().currentTestName),
                });
                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result);
            });
        });

        describe('actor is reader', () => {
            const validateActorMockSteps = mocks.CREATENEWVERSION__VALIDATEACTOR__NO_PERMISSION__STEP_MOCKS;
            it('stops after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testCreateNewVersionWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {createNewVersion: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: validateActorMockSteps,
                    createNewVersion: mocks.CREATENEWVERSION__CREATENEWVERSION__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('createNewVersion', expect.getState().currentTestName),
                });
                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result, 'BUILD', false);
            });
        });

        describe('one step fails', () => {
            it('announces failure on Slack', async () => {
                const repoPath = mockGithub.repo.getPath('testCreateNewVersionWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {createNewVersion: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.CREATENEWVERSION__VALIDATEACTOR__ADMIN__STEP_MOCKS,
                    createNewVersion: utils.deepCopy(mocks.CREATENEWVERSION__CREATENEWVERSION__STEP_MOCKS),
                };
                testMockSteps.createNewVersion[5] = utils.createMockStep('Commit new version', 'Commit new version', 'CREATENEWVERSION', [], [], [], [], false);
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('createNewVersion', expect.getState().currentTestName),
                });
                assertions.assertValidateActorJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result, 'BUILD', true, false);
            });
        });

        it('chooses source branch depending on the SEMVER_LEVEL', async () => {
            const repoPath = mockGithub.repo.getPath('testCreateNewVersionWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, {SEMVER_LEVEL: 'MAJOR'});
            act = utils.setJobRunners(act, {createNewVersion: 'ubuntu-latest'}, workflowPath);
            const testMockSteps = {
                validateActor: mocks.CREATENEWVERSION__VALIDATEACTOR__ADMIN__STEP_MOCKS,
                createNewVersion: mocks.CREATENEWVERSION__CREATENEWVERSION__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'createNewVersion.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Author',
                logFile: utils.getLogFilePath('createNewVersion', expect.getState().currentTestName),
            });
            assertions.assertValidateActorJobExecuted(result);
            assertions.assertCreateNewVersionJobExecuted(result, 'MAJOR');
        });
    });
});
