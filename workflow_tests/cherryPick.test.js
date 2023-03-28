const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/cherryPickAssertions');
const mocks = require('./mocks/cherryPickMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(60 * 1000);
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'cherryPick.yml'),
        dest: '.github/workflows/cherryPick.yml',
    },
];

describe('test workflow cherryPick', () => {
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
                        NEW_VERSION: '',
                    },
                );
                const testMockSteps = {
                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS,
                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                    cherryPick: mocks.getCherryPickMockSteps(true, true, true),
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertValidateActorJobExecuted(result, actor);
                assertions.assertCreateNewVersionJobExecuted(result, false);
                assertions.assertCherryPickJobExecuted(result, actor, '1234', '1.2.3', false);
            });
        });
        describe('actor is OSBotify', () => {
            const actor = 'OSBotify';
            const newVersion = '';
            const mergeConflicts = false;
            const versionsMatch = true;
            const prIsMergeable = true;
            it('behaviour is the same as with actor being the deployer', async () => {
                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                const testMockSteps = {
                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS,
                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                    cherryPick: mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts),
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
                        NEW_VERSION: newVersion,
                    },
                );
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertValidateActorJobExecuted(result, actor);
                assertions.assertCreateNewVersionJobExecuted(result);
                assertions.assertCherryPickJobExecuted(
                    result,
                    actor,
                    '1234',
                    '1.2.3',
                    true,
                    mergeConflicts || !versionsMatch,
                    !mergeConflicts,
                    versionsMatch,
                    prIsMergeable,
                    newVersion,
                );
            });
        });
        describe('actor is a deployer', () => {
            const actor = 'Dummy Author';
            describe('input version not set', () => {
                const newVersion = '';
                describe('no merge conflicts', () => {
                    const mergeConflicts = false;
                    describe('version match', () => {
                        const versionsMatch = true;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, new version created, PR approved and merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, new version created, PR is not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                    describe('version do not match', () => {
                        const versionsMatch = false;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, new version created, PR auto-assigned and commented, approved and merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, new version created, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                });
                describe('merge conflicts', () => {
                    const mergeConflicts = true;
                    describe('version match', () => {
                        const versionsMatch = true;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, new version created, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, new version created, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                    describe('version do not match', () => {
                        const versionsMatch = false;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, new version created, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, new version created, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                });
            });

            describe('input version set', () => {
                const newVersion = '1.2.3';
                describe('no merge conflicts', () => {
                    const mergeConflicts = false;
                    describe('version match', () => {
                        const versionsMatch = true;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, PR approved and merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, PR is not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                    describe('version do not match', () => {
                        const versionsMatch = false;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, PR auto-assigned and commented, approved and merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                });
                describe('merge conflicts', () => {
                    const mergeConflicts = true;
                    describe('version match', () => {
                        const versionsMatch = true;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                    describe('version do not match', () => {
                        const versionsMatch = false;
                        describe('PR is mergeable', () => {
                            const prIsMergeable = true;
                            it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                        describe('PR is not mergeable', () => {
                            const prIsMergeable = false;
                            it('workflow executes, PR auto-assigned and commented, not merged automatically', async () => {
                                const repoPath = mockGithub.repo.getPath('testCherryPickWorkflowRepo') || '';
                                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cherryPick.yml');
                                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                                const testMockSteps = {
                                    validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                                    createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                                };
                                testMockSteps.cherryPick = mocks.getCherryPickMockSteps(versionsMatch, prIsMergeable, !mergeConflicts);
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
                                        NEW_VERSION: newVersion,
                                    },
                                );
                                const result = await act
                                    .runEvent(event, {
                                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                                        mockSteps: testMockSteps,
                                        actor,
                                    });

                                assertions.assertValidateActorJobExecuted(result, actor);
                                assertions.assertCreateNewVersionJobExecuted(result, false);
                                assertions.assertCherryPickJobExecuted(
                                    result,
                                    actor,
                                    '1234',
                                    '1.2.3',
                                    true,
                                    mergeConflicts || !versionsMatch,
                                    !mergeConflicts,
                                    versionsMatch,
                                    prIsMergeable,
                                    newVersion,
                                );
                            });
                        });
                    });
                });
            });
        });
    });
    describe('autmatic trigger', () => {
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
                    NEW_VERSION: '',
                },
            );
            const testMockSteps = {
                validateActor: mocks.CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
                createNewVersion: mocks.CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
                cherryPick: mocks.getCherryPickMockSteps(true, true, true),
            };
            const result = await act
                .runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                });

            assertions.assertValidateActorJobExecuted(result, 'Dummy Author', false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertCherryPickJobExecuted(result, 'Dummy Author', '1234', '1.2.3', false);
        });
    });
});
