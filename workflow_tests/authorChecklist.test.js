const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/authorChecklistAssertions');
const mocks = require('./mocks/authorChecklistMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'authorChecklist.yml'),
        dest: '.github/workflows/authorChecklist.yml',
    },
];

describe('test workflow authorChecklist', () => {
    const githubToken = 'dummy_github_token';

    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testAuthorChecklistWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('pull request opened', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'opened',
        };
        describe('actor is not OSBotify', () => {
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
    describe('pull request edited', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'edited',
        };
        describe('actor is not OSBotify', () => {
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
    describe('pull request reopened', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'reopened',
        };
        describe('actor is not OSBotify', () => {
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                    logFile: utils.getLogFilePath('authorChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
});
