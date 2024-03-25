import type {MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import * as kieMockGithub from '@kie/mock-github';
import type {CreateRepositoryFile, MockGithub} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/authorChecklistAssertions';
import mocks from './mocks/authorChecklistMocks';
import ExtendedAct from './utils/ExtendedAct';
import * as utils from './utils/utils';

jest.setTimeout(90 * 1000);

let mockGithub: MockGithub;

const FILES_TO_COPY_INTO_TEST_REPO: CreateRepositoryFile[] = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'authorChecklist.yml'),
        dest: '.github/workflows/authorChecklist.yml',
    },
];

describe('test workflow authorChecklist', () => {
    const githubToken = 'dummy_github_token';

    beforeAll(() => {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
                const repoPath = mockGithub.repo.getPath('testAuthorChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'authorChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
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
