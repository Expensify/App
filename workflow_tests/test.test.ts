import type {MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import * as kieMockGithub from '@kie/mock-github';
import type {CreateRepositoryFile, MockGithub} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/testAssertions';
import mocks from './mocks/testMocks';
import ExtendedAct from './utils/ExtendedAct';
import * as utils from './utils/utils';

jest.setTimeout(90 * 1000);

let mockGithub: MockGithub;

const FILES_TO_COPY_INTO_TEST_REPO: CreateRepositoryFile[] = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'test.yml'),
        dest: '.github/workflows/test.yml',
    },
];

describe('test workflow test', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';
    const osbotifyActor = 'OSBotify';

    beforeAll(() => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testTestWorkflowRepo: {
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
        it('runs all tests', async () => {
            const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps: MockStep = {
                jest: mocks.TEST__JEST__STEP_MOCKS,
                shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
            });

            assertions.assertJestJobExecuted(result);
            assertions.assertShellTestsJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            it('does not run tests', async () => {
                const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
                    jest: mocks.TEST__JEST__STEP_MOCKS,
                    shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                    mockSteps: testMockSteps,
                    actor: osbotifyActor,
                    logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
                });

                assertions.assertJestJobExecuted(result, false);
                assertions.assertShellTestsJobExecuted(result, false);
            });
        });
    });

    describe('pull request synchronized', () => {
        const event = 'pull_request';
        const eventOptions = {
            action: 'synchronize',
        };
        it('runs all tests', async () => {
            const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps: MockStep = {
                jest: mocks.TEST__JEST__STEP_MOCKS,
                shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
            });

            assertions.assertJestJobExecuted(result);
            assertions.assertShellTestsJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            it('does not run tests', async () => {
                const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
                    jest: mocks.TEST__JEST__STEP_MOCKS,
                    shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                    mockSteps: testMockSteps,
                    actor: osbotifyActor,
                    logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
                });

                assertions.assertJestJobExecuted(result, false);
                assertions.assertShellTestsJobExecuted(result, false);
            });
        });
    });

    describe('event is workflow_call', () => {
        const event = 'workflow_call';
        const eventOptions = {};
        it('runs all tests', async () => {
            const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps: MockStep = {
                jest: mocks.TEST__JEST__STEP_MOCKS,
                shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
            });

            assertions.assertJestJobExecuted(result);
            assertions.assertShellTestsJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            it('runs all tests normally', async () => {
                const repoPath = mockGithub.repo.getPath('testTestWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'test.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
                    jest: mocks.TEST__JEST__STEP_MOCKS,
                    shellTests: mocks.TEST__SHELLTESTS__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'test.yml'),
                    mockSteps: testMockSteps,
                    actor: osbotifyActor,
                    logFile: utils.getLogFilePath('test', expect.getState().currentTestName),
                });

                assertions.assertJestJobExecuted(result);
                assertions.assertShellTestsJobExecuted(result);
            });
        });
    });
});
