import {MockGithub} from '@kie/mock-github';
import {Act} from '@kie/act-js';
import path from 'path';
import * as mocks from './mocks/preDeployMocks';
import * as assertions from './assertions/preDeployAssertions';
import * as utils from './utils';

let mockGithub: MockGithub;
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'preDeploy.yml'),
        dest: '.github/workflows/preDeploy.yml',
    },
    {
        src: path.resolve(__dirname, '..', '.github', '.eslintrc.js'),
        dest: '.github/.eslintrc.js',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'actionlint.yaml'),
        dest: '.github/actionlint.yaml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new MockGithub({
        repo: {
            testWorkflowsRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

const MOCK_STEPS = {
    lint: mocks.LINT_JOB_MOCK_STEPS,
    test: mocks.TEST_JOB_MOCK_STEPS,
    confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
    skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
    createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
    updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
    isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
    newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
    'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
};

describe('test workflow preDeploy', () => {
    test('push to main', async () => {
        // get path to the local test repo
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';

        // get path to the workflow file under test
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

        // instantiate Act in the context of the test repo and given workflow file
        let act = new Act(repoPath, workflowPath);

        // set run parameters
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'},
            'dummy_github_token',
        );

        // set up mocks
        const testMockSteps = MOCK_STEPS;

        // run an event and get the result
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
            });

        // assert results (some steps can run in parallel to each other so the order is not assured
        // therefore we can check which steps have been executed, but not the set job order
        assertions.assertLintJobExecuted(result);
        assertions.assertTestJobExecuted(result);
        assertions.assertIsExpensifyEmployeeJobExecuted(result);
        assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertions.assertChooseDeployActionsJobExecuted(result);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result);
        assertions.assertUpdateStagingJobExecuted(result);
    }, 60000);

    test('lint job failed', async () => {
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new Act(repoPath, workflowPath);
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'},
            'dummy_github_token',
        );
        const testMockSteps = {
            lint: [
                {
                    name: 'Run lint workflow',
                    mockWith: 'echo [MOCK] [LINT] Running lint workflow\n'
                        + 'echo [MOCK] [LINT] Lint workflow failed\n'
                        + 'exit 1',
                },
            ],
            test: mocks.TEST_JOB_MOCK_STEPS,
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
            newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
            'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
        };
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
            });
        expect(result).toEqual(expect.arrayContaining(
            [{
                name: 'Main Run lint workflow',
                status: 1,
                output: '[MOCK] [LINT] Running lint workflow\n'
                    + '[MOCK] [LINT] Lint workflow failed',
            }],
        ));
        assertions.assertTestJobExecuted(result);
        assertions.assertIsExpensifyEmployeeJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [
                {
                    name: 'Main Announce failed workflow in Slack',
                    status: 0,
                    output: '[MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=***', // no access to secrets
                },
                {
                    name: 'Main Exit failed workflow',
                    status: 1,
                    output: '',
                },
            ],
        ));
        assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertions.assertChooseDeployActionsJobExecuted(result, false);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result, false);
        assertions.assertUpdateStagingJobExecuted(result, false);
    }, 60000);

    test('test job failed', async () => {
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new Act(repoPath, workflowPath);
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'},
            'dummy_github_token',
        );
        const testMockSteps = {
            lint: mocks.LINT_JOB_MOCK_STEPS,
            test: [
                {
                    name: 'Run test workflow',
                    mockWith: 'echo [MOCK] [TEST] Running test workflow\n'
                        + 'echo [MOCK] [TEST] Test workflow failed\n'
                        + 'exit 1',
                },
            ],
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
            newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
            'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
        };
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
            });
        assertions.assertLintJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [{
                name: 'Main Run test workflow',
                status: 1,
                output: '[MOCK] [TEST] Running test workflow\n'
                    + '[MOCK] [TEST] Test workflow failed',
            }],
        ));
        assertions.assertIsExpensifyEmployeeJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [
                {
                    name: 'Main Announce failed workflow in Slack',
                    status: 0,
                    output: '[MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=***', // no access to secrets
                },
                {
                    name: 'Main Exit failed workflow',
                    status: 1,
                    output: '',
                },
            ],
        ));
        assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertions.assertChooseDeployActionsJobExecuted(result, false);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result, false);
        assertions.assertUpdateStagingJobExecuted(result, false);
    }, 60000);
});
