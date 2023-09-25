const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/testBuildAssertions');
const mocks = require('./mocks/testBuildMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'testBuild.yml'),
        dest: '.github/workflows/testBuild.yml',
    },
];

describe('test workflow testBuild', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';
    const secrets = {
        OS_BOTIFY_TOKEN: 'dummy_osbotify_token',
        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
        AWS_ACCESS_KEY_ID: 'dummy_aws_access_kry_id',
        AWS_SECRET_ACCESS_KEY: 'dummy_aws_secret_access_key',
        DEVELOPER_ID_SECRET_PASSPHRASE: 'dummy_developer_id_secret_passphrase',
        CSC_LINK: 'dummy_csc_link',
        CSC_KEY_PASSWORD: 'dummy_csc_key_password',
        APPLE_ID_PASSWORD: 'dummy_apple_id_password',
        APPLE_ID: 'dummy_apple_id_value',
        MYAPP_UPLOAD_STORE_PASSWORD: 'dummy_myapp_upload_store_password',
        MYAPP_UPLOAD_KEY_PASSWORD: 'dummy_myapp_upload_key_password',
    };

    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testTestBuildWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('event is workflow_dispatch', () => {
        const event = 'workflow_dispatch';
        const inputs = {
            PULL_REQUEST_NUMBER: '1234',
        };
        it('executes workflow', async () => {
            const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
            act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
            const testMockSteps = {
                validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
            });

            assertions.assertValidateActorJobExecuted(result, '1234');
            assertions.assertGetBranchRefJobExecuted(result);
            assertions.assertAndroidJobExecuted(result, 'test-ref');
            assertions.assertIOSJobExecuted(result, 'test-ref');
            assertions.assertDesktopJobExecuted(result, 'test-ref');
            assertions.assertWebJobExecuted(result, 'test-ref');
            assertions.assertPostGithubCommentJobExecuted(result, 'test-ref');
        });
        describe('actor is not a team member', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('actor is not a team member and PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('android fails', () => {
            it('executes workflow, failure reflected', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: utils.deepCopy(mocks.TESTBUILD__ANDROID__STEP_MOCKS),
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                testMockSteps.android[4] = utils.createMockStep('Decrypt keystore', 'Decrypt keystore', 'ANDROID', [], ['LARGE_SECRET_PASSPHRASE'], {}, {}, false);
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result);
                assertions.assertAndroidJobExecuted(result, 'test-ref', true, 4);
                assertions.assertIOSJobExecuted(result, 'test-ref');
                assertions.assertDesktopJobExecuted(result, 'test-ref');
                assertions.assertWebJobExecuted(result, 'test-ref');
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', true, 'failure', 'success', 'success', 'success');
            });
        });
        describe('iOS fails', () => {
            it('executes workflow, failure reflected', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: utils.deepCopy(mocks.TESTBUILD__IOS__STEP_MOCKS),
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                testMockSteps.iOS[8] = utils.createMockStep('Install cocoapods', 'Install cocoapods', 'IOS', ['timeout_minutes', 'max_attempts', 'command'], [], {}, {}, false);
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result);
                assertions.assertAndroidJobExecuted(result, 'test-ref');
                assertions.assertIOSJobExecuted(result, 'test-ref', true, 8);
                assertions.assertDesktopJobExecuted(result, 'test-ref');
                assertions.assertWebJobExecuted(result, 'test-ref');
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', true, 'success', 'failure', 'success', 'success');
            });
        });
        describe('desktop fails', () => {
            it('executes workflow, failure reflected', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: utils.deepCopy(mocks.TESTBUILD__DESKTOP__STEP_MOCKS),
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                testMockSteps.desktop[3] = utils.createMockStep(
                    'Decrypt Developer ID Certificate',
                    'Decrypt Developer ID Certificate',
                    'DESKTOP',
                    [],
                    ['DEVELOPER_ID_SECRET_PASSPHRASE'],
                    {},
                    {},
                    false,
                );
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result);
                assertions.assertAndroidJobExecuted(result, 'test-ref');
                assertions.assertIOSJobExecuted(result, 'test-ref');
                assertions.assertDesktopJobExecuted(result, 'test-ref', true, 3);
                assertions.assertWebJobExecuted(result, 'test-ref');
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', true, 'success', 'success', 'failure', 'success');
            });
        });
        describe('web fails', () => {
            it('executes workflow, failure reflected', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, {}, secrets, githubToken, {}, inputs);
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: utils.deepCopy(mocks.TESTBUILD__WEB__STEP_MOCKS),
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                testMockSteps.web[3] = utils.createMockStep(
                    'Configure AWS Credentials',
                    'Configure AWS Credentials',
                    'WEB',
                    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
                    [],
                    {},
                    {},
                    false,
                );
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result);
                assertions.assertAndroidJobExecuted(result, 'test-ref');
                assertions.assertIOSJobExecuted(result, 'test-ref');
                assertions.assertDesktopJobExecuted(result, 'test-ref');
                assertions.assertWebJobExecuted(result, 'test-ref', true, 3);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', true, 'success', 'success', 'success', 'failure');
            });
        });
    });
    describe('pull request opened', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'opened',
            number: '1234',
            pull_request: {
                head: {
                    sha: 'test-ref',
                },
            },
        };
        it('executes workflow, without getBranchRef', async () => {
            const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
            act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
            const testMockSteps = {
                validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
            });

            assertions.assertValidateActorJobExecuted(result, '1234');
            assertions.assertGetBranchRefJobExecuted(result, false);
            assertions.assertAndroidJobExecuted(result, 'test-ref');
            assertions.assertIOSJobExecuted(result, 'test-ref');
            assertions.assertDesktopJobExecuted(result, 'test-ref');
            assertions.assertWebJobExecuted(result, 'test-ref');
            assertions.assertPostGithubCommentJobExecuted(result, 'test-ref');
        });
        describe('actor is not a team member', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('actor is not a team member and PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
    });
    describe('pull request synchronized', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'synchronize',
            number: '1234',
            pull_request: {
                head: {
                    sha: 'test-ref',
                },
            },
        };
        it('executes workflow, without getBranchRef', async () => {
            const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
            act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
            const testMockSteps = {
                validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
            });

            assertions.assertValidateActorJobExecuted(result, '1234');
            assertions.assertGetBranchRefJobExecuted(result, false);
            assertions.assertAndroidJobExecuted(result, 'test-ref');
            assertions.assertIOSJobExecuted(result, 'test-ref');
            assertions.assertDesktopJobExecuted(result, 'test-ref');
            assertions.assertWebJobExecuted(result, 'test-ref');
            assertions.assertPostGithubCommentJobExecuted(result, 'test-ref');
        });
        describe('actor is not a team member', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('actor is not a team member and PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
    });
    describe('pull request labeled', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'labeled',
            number: '1234',
            pull_request: {
                head: {
                    sha: 'test-ref',
                },
            },
        };
        it('executes workflow, withuout getBranchRef', async () => {
            const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
            act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
            const testMockSteps = {
                validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
            });

            assertions.assertValidateActorJobExecuted(result, '1234');
            assertions.assertGetBranchRefJobExecuted(result, false);
            assertions.assertAndroidJobExecuted(result, 'test-ref');
            assertions.assertIOSJobExecuted(result, 'test-ref');
            assertions.assertDesktopJobExecuted(result, 'test-ref');
            assertions.assertWebJobExecuted(result, 'test-ref');
            assertions.assertPostGithubCommentJobExecuted(result, 'test-ref');
        });
        describe('actor is not a team member', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
        describe('actor is not a team member and PR does not have READY_TO_BUILD label', () => {
            it('stops the workflow after validation', async () => {
                const repoPath = mockGithub.repo.getPath('testTestBuildWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'testBuild.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, secrets, githubToken, {});
                act = utils.setJobRunners(act, {iOS: 'ubuntu-latest', desktop: 'ubuntu-latest', web: 'ubuntu-latest', android: 'ubuntu-latest'}, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
                    getBranchRef: mocks.TESTBUILD__GETBRANCHREF__STEP_MOCKS,
                    android: mocks.TESTBUILD__ANDROID__STEP_MOCKS,
                    iOS: mocks.TESTBUILD__IOS__STEP_MOCKS,
                    desktop: mocks.TESTBUILD__DESKTOP__STEP_MOCKS,
                    web: mocks.TESTBUILD__WEB__STEP_MOCKS,
                    postGithubComment: mocks.TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'testBuild.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('testBuild', expect.getState().currentTestName),
                });

                assertions.assertValidateActorJobExecuted(result, '1234');
                assertions.assertGetBranchRefJobExecuted(result, false);
                assertions.assertAndroidJobExecuted(result, 'test-ref', false);
                assertions.assertIOSJobExecuted(result, 'test-ref', false);
                assertions.assertDesktopJobExecuted(result, 'test-ref', false);
                assertions.assertWebJobExecuted(result, 'test-ref', false);
                assertions.assertPostGithubCommentJobExecuted(result, 'test-ref', '1234', false);
            });
        });
    });
});
