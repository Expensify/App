const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const assertions = require('./assertions/failureNotifierAssertions');
const mocks = require('./mocks/failureNotifierMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'failureNotifier.yml'),
        dest: '.github/workflows/failureNotifier.yml',
    },
];

describe('test workflow failureNotifier', () => {
    const actor = 'Dummy Actor';
    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testFailureNotifierWorkflowRepo: {
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
    it('runs the notify failure when main fails', async () => {
        const repoPath = mockGithub.repo.getPath('testFailureNotifierWorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'failureNotifier.yml');
        let act = new eAct.ExtendedAct(repoPath, workflowPath);
        const event = 'workflow_run';
        act = act.setEvent({
            workflow_run: {
                name: 'Process new code merged to main',
                conclusion: 'failure',
            },
        });
        const testMockSteps = {
            notifyFailure: mocks.FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS,
        };
        const result = await act.runEvent(event, {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'failureNotifier.yml'),
            mockSteps: testMockSteps,
            actor,
        });

        // assert execution with imported assertions
        assertions.assertNotifyFailureJobExecuted(result);
    });
});
