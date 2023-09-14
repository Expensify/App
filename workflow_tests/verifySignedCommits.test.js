const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/verifySignedCommitsAssertions');
const mocks = require('./mocks/verifySignedCommitsMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'verifySignedCommits.yml'),
        dest: '.github/workflows/verifySignedCommits.yml',
    },
];

describe('test workflow verifySignedCommits', () => {
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
                testVerifySignedCommitsWorkflowRepo: {
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
        it('test stub', async () => {
            const repoPath = mockGithub.repo.getPath('testVerifySignedCommitsWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'verifySignedCommits.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps = {
                verifySignedCommits: mocks.VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'verifySignedCommits.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('verifySignedCommits', expect.getState().currentTestName),
            });

            assertions.assertVerifySignedCommitsJobExecuted(result);
        });
    });
    describe('pull request synchronized', () => {
        const event = 'pull_request';
        const eventOptions = {
            action: 'synchronize',
        };
        it('test stub', async () => {
            const repoPath = mockGithub.repo.getPath('testVerifySignedCommitsWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'verifySignedCommits.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps = {
                verifySignedCommits: mocks.VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'verifySignedCommits.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('verifySignedCommits', expect.getState().currentTestName),
            });

            assertions.assertVerifySignedCommitsJobExecuted(result);
        });
    });
});
