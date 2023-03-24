const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/claAssertions');
const mocks = require('./mocks/claMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'cla.yml'),
        dest: '.github/workflows/cla.yml',
    },
];

describe('test workflow cla', () => {
    const secrets = {
        CLA_BOTIFY_TOKEN: 'dummy_cla_botify_token',
    };
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Author';

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testClaWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('event is issue_comment', () => {
        const event = 'issue_comment';
        describe('no regex matches', () => {
            const commentBody = 'Comment body';
            const eventData = {
                action: 'created',
                issue: {
                    pull_request: {
                        number: 1234,
                    },
                },
                comment: {
                    body: commentBody,
                },
            };
            it('workflow executes, CLA assistant step not run', async () => {
                const repoPath = mockGithub.repo.getPath('testClaWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cla.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventData,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    CLA: mocks.CLA__CLA__NO_MATCHES__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertCLAJobExecuted(result, commentBody, `${repoPath}/remote/origin`, true, false);
            });
        });
        describe('check regex matches', () => {
            const commentBody = 'I have read the CLA Document and I hereby sign the CLA';
            const eventData = {
                action: 'created',
                issue: {
                    pull_request: {
                        number: 1234,
                    },
                },
                comment: {
                    body: commentBody,
                },
            };
            it('workflow executes, CLA assistant step run', async () => {
                const repoPath = mockGithub.repo.getPath('testClaWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cla.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventData,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    CLA: mocks.CLA__CLA__CHECK_MATCH__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertCLAJobExecuted(result, commentBody, `${repoPath}/remote/origin`, true, true);
            });
        });
        describe('re-check regex matches', () => {
            const commentBody = 'recheck';
            const eventData = {
                action: 'created',
                issue: {
                    pull_request: {
                        number: 1234,
                    },
                },
                comment: {
                    body: commentBody,
                },
            };
            it('workflow executes, CLA assistant step run', async () => {
                const repoPath = mockGithub.repo.getPath('testClaWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cla.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventData,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    CLA: mocks.CLA__CLA__RECHECK_MATCH__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertCLAJobExecuted(result, commentBody, `${repoPath}/remote/origin`, true, true);
            });
        });
    });
    describe('event is pull_request_target', () => {
        const event = 'pull_request_target';
        describe('no regex matches - there\'s no comment', () => {
            const eventData = {
                action: 'opened',
                issue: {
                    pull_request: {
                        number: 1234,
                    },
                },
            };
            it('workflow executes, CLA assistant step still run', async () => {
                const repoPath = mockGithub.repo.getPath('testClaWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'cla.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventData,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    CLA: mocks.CLA__CLA__NO_MATCHES__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertCLAJobExecuted(result, '', `${repoPath}/remote/origin`, true, true);
            });
        });
    });
    describe('different event', () => {
        const event = 'push';
        it('workflow does not execute', async () => {
            const eventData = {
                ref: 'main',
            };
            const repoPath = mockGithub.repo.getPath('testClaWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'cla.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                event,
                eventData,
                secrets,
                githubToken,
            );
            const testMockSteps = {
                CLA: mocks.CLA__CLA__NO_MATCHES__STEP_MOCKS,
            };
            const result = await act
                .runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor,
                });

            assertions.assertCLAJobExecuted(result, '', `${repoPath}/remote/origin`, false);
        });
    });
});
