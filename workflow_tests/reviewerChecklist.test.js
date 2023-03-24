const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/reviewerChecklistAssertions');
const mocks = require('./mocks/reviewerChecklistMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'reviewerChecklist.yml'),
        dest: '.github/workflows/reviewerChecklist.yml',
    },
];

describe('test workflow reviewerChecklist', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';
    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
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
            const repoPath = mockGithub.repo.getPath('testReviewerChecklistWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                event,
                eventOptions,
                {},
                githubToken,
            );
            const testMockSteps = {
                checklist: mocks.REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS,
            };
            const result = await act
                .runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor,
                });

            assertions.assertChecklistJobExecuted(result);
        });
        describe('actor is OSBotify', () => {
            const osbotifyActor = 'OSBotify';
            it('does not run the workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testReviewerChecklistWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'reviewerChecklist.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    {},
                    githubToken,
                );
                const testMockSteps = {
                    checklist: mocks.REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows'),
                        mockSteps: testMockSteps,
                        actor: osbotifyActor,
                    });

                assertions.assertChecklistJobExecuted(result, false);
            });
        });
    });
});
