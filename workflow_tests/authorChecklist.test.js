const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/authorChecklistAssertions');
const mocks = require('./mocks/authorChecklistMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'authorChecklist.yml'),
        dest: '.github/workflows/authorChecklist.yml',
    },
];

describe('test workflow authorChecklist', () => {
    const githubToken = 'dummy_github_token';
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
        const event = 'pull_request';
        const eventOptions = {
            action: 'opened',
        };
        describe('actor is not OSBotify', () => {
            const actor = 'Dummy Author';
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            const actor = 'OSBotify';
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
    describe('pull request edited', () => {
        const event = 'pull_request';
        const eventOptions = {
            action: 'edited',
        };
        describe('actor is not OSBotify', () => {
            const actor = 'Dummy Author';
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            const actor = 'OSBotify';
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
    describe('pull request reopened', () => {
        const event = 'pull_request';
        const eventOptions = {
            action: 'reopened',
        };
        describe('actor is not OSBotify', () => {
            const actor = 'Dummy Author';
            it('executes workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result);
            });
        });
        describe('actor is OSBotify', () => {
            const actor = 'OSBotify';
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor,
                    });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
});
