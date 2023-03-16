const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/authorChecklistAssertions');
const mocks = require('./mocks/authorChecklistMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'authorChecklist.yml'),
        dest: '.github/workflows/authorChecklist.yml',
    },
];

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

describe('test workflow authorChecklist', () => {
    describe('pull request opened', () => {
        describe('actor is not OSBotify', () => {
            test('workflow executes', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'opened',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'Dummy Author',
                    });

                assertions.assertChecklistJobExecuted(result);
            }, 60000);
        });
        describe('actor is OSBotify', () => {
            test('workflow does not execute', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'opened',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'OSBotify',
                    });

                assertions.assertChecklistJobExecuted(result, false);
            }, 60000);
        });
    });
    describe('pull request edited', () => {
        describe('actor is not OSBotify', () => {
            test('workflow executes', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'edited',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'Dummy Author',
                    });

                assertions.assertChecklistJobExecuted(result);
            }, 60000);
        });
        describe('actor is OSBotify', () => {
            test('workflow does not execute', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'edited',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'OSBotify',
                    });

                assertions.assertChecklistJobExecuted(result, false);
            }, 60000);
        });
    });
    describe('pull request reopened', () => {
        describe('actor is not OSBotify', () => {
            test('workflow executes', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'reopened',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'Dummy Author',
                    });

                assertions.assertChecklistJobExecuted(result);
            }, 60000);
        });
        describe('actor is OSBotify', () => {
            test('workflow does not execute', async () => {
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    'pull_request',
                    {
                        action: 'reopened',
                    },
                    {},
                    'dummy_github_token',
                );
                const testMockSteps = {
                    checklist: mocks.AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent('pull_request', {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: 'OSBotify',
                    });

                assertions.assertChecklistJobExecuted(result, false);
            }, 60000);
        });
    });
});
