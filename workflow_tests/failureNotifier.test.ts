import type {MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import type {CreateRepositoryFile} from '@kie/mock-github';
import {MockGithub} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/failureNotifierAssertions';
import mocks from './mocks/failureNotifierMocks';
import ExtendedAct from './utils/ExtendedAct';

jest.setTimeout(90 * 1000);
let mockGithub: MockGithub;

const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'failureNotifier.yml'),
        dest: '.github/workflows/failureNotifier.yml',
    },
] as const satisfies CreateRepositoryFile[];

describe('test workflow failureNotifier', () => {
    const actor = 'Dummy Actor';
    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new MockGithub({
            repo: {
                testFailureNotifierWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,

                    // if any branches besides main are needed add: pushedBranches: ['staging', 'production'],
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    it('runs the notify failure when main fails', async () => {
        const repoPath = mockGithub.repo.getPath('testFailureNotifierWorkflowRepo') ?? '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'failureNotifier.yml');
        let act = new ExtendedAct(repoPath, workflowPath);
        const event = 'workflow_run';
        act = act.setEvent({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            workflow_run: {
                name: 'Process new code merged to main',
                conclusion: 'failure',
            },
        });
        const testMockSteps = {
            notifyFailure: mocks.FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS,
        } as const satisfies MockStep;

        const result = await act.runEvent(event, {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'failureNotifier.yml'),
            mockSteps: testMockSteps,
            actor,
        });

        // assert execution with imported assertions
        assertions.assertNotifyFailureJobExecuted(result);
    });
});
