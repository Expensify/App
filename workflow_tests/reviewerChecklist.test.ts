import type {MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import {MockGithub} from '@kie/mock-github';
import type {CreateRepositoryFile} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/reviewerChecklistAssertions';
import mocks from './mocks/reviewerChecklistMocks';
import ExtendedAct from './utils/ExtendedAct';
import * as utils from './utils/utils';

jest.setTimeout(90 * 1000);

let mockGithub: MockGithub;

const FILES_TO_COPY_INTO_TEST_REPO: CreateRepositoryFile[] = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'reviewerChecklist.yml'),
        dest: '.github/workflows/reviewerChecklist.yml',
    },
];

describe('test workflow reviewerChecklist', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';

    beforeAll(() => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new MockGithub({
            repo: {
                testReviewerChecklistWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });
        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('event is pull_request_review', () => {
        const event = 'pull_request_review';
        const eventOptions = {};
        it('runs the workflow', async () => {
            const repoPath = mockGithub.repo.getPath('testReviewerChecklistWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
            const testMockSteps: MockStep = {
                checklist: mocks.REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS,
            };
            const result = await act.runEvent(event, {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml'),
                mockSteps: testMockSteps,
                actor,
                logFile: utils.getLogFilePath('reviewerChecklist', expect.getState().currentTestName),
            });

            assertions.assertChecklistJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            const osbotifyActor = 'OSBotify';
            it('does not run the workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testReviewerChecklistWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, eventOptions, {}, githubToken);
                const testMockSteps: MockStep = {
                    checklist: mocks.REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml'),
                    mockSteps: testMockSteps,
                    actor: osbotifyActor,
                    logFile: utils.getLogFilePath('reviewerChecklist', expect.getState().currentTestName),
                });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
});
