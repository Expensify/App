const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/lintAssertions');
const mocks = require('./mocks/lintMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'lint.yml'),
        dest: '.github/workflows/lint.yml',
    },
];

describe('test workflow lint', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';

    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testLintWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,

                    // if any branches besides main are need add: pushedBranches: ['staging', 'production'],
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
        const eventOptions = {};
        it('runs the lint', async () => {
            const repoPath = mockGithub.repo.getPath('testLintWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'lint.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps = {
                lint: mocks.LINT__LINT__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'lint.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('lint', expect.getState().currentTestName),
            });

            assertions.assertLintJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            const testActor = 'OSBotify';
            it('runs the lint', async () => {
                const repoPath = mockGithub.repo.getPath('testLintWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'lint.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    lint: mocks.LINT__LINT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'lint.yml'),
                    mockSteps: testMockSteps,
                    actor: testActor,
                    logFile: utils.getLogFilePath('lint', expect.getState().currentTestName),
                });

                assertions.assertLintJobExecuted(result);
            });
        });
    });
    describe('event is pull_request', () => {
        const event = 'pull_request';
        describe('pull_request is opened', () => {
            const eventOptions = {
                action: 'opened',
            };
            it('runs the lint', async () => {
                const repoPath = mockGithub.repo.getPath('testLintWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'lint.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    lint: mocks.LINT__LINT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'lint.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('lint', expect.getState().currentTestName),
                });

                assertions.assertLintJobExecuted(result);
            });
            describe('actor is OSBotify', () => {
                const testActor = 'OSBotify';
                it('does not run the lint', async () => {
                    const repoPath = mockGithub.repo.getPath('testLintWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'lint.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                    const testMockSteps = {
                        lint: mocks.LINT__LINT__STEP_MOCKS,
                    };
                    const result = await act.runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows', 'lint.yml'),
                        mockSteps: testMockSteps,
                        actor: testActor,
                        logFile: utils.getLogFilePath('lint', expect.getState().currentTestName),
                    });

                    assertions.assertLintJobExecuted(result, false);
                });
            });
        });
        describe('pull_request is synchronized', () => {
            const eventOptions = {
                action: 'synchronize',
            };
            it('runs the lint', async () => {
                const repoPath = mockGithub.repo.getPath('testLintWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'lint.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps = {
                    lint: mocks.LINT__LINT__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'lint.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('lint', expect.getState().currentTestName),
                });

                assertions.assertLintJobExecuted(result);
            });
        });
    });
});
