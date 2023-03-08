const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/preDeployAssertions');
const mocks = require('./mocks/preDeployMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'preDeploy.yml'),
        dest: '.github/workflows/preDeploy.yml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testPreDeployWorkflowRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
                pushedBranches: ['different_branch'],
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test workflow preDeploy', () => {
    test('push to main - workflow executes', async () => {
        // get path to the local test repo
        const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';

        // get path to the workflow file under test
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

        // instantiate Act in the context of the test repo and given workflow file
        let act = new eAct.ExtendedAct(repoPath, workflowPath);

        // set run parameters
        act = utils.setUpActParams(
            act,
            'push',
            {ref: 'refs/heads/main'},
            {
                OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );

        // set up mocks
        const testMockSteps = {
            lint: mocks.LINT_JOB_MOCK_STEPS,
            test: mocks.TEST_JOB_MOCK_STEPS,
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
            newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
            'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
        };

        // run an event and get the result
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
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

    // using a different branch does not seem to work as described in documentation
    // test('push to different branch - workflow does not execute', async () => {
    //     const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
    //     const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
    //     let act = new eAct.ExtendedAct(repoPath, workflowPath);
    //     act = utils.setUpActParams(
    //         act,
    //         'push',
    //         {
    //             ref: 'refs/heads/different_branch',
    //         },
    //         {
    //             OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
    //         },
    //         'dummy_github_token',
    //     );
    //     const testMockSteps = {
    //         lint: mocks.LINT_JOB_MOCK_STEPS,
    //         test: mocks.TEST_JOB_MOCK_STEPS,
    //         confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    //         chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
    //         skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
    //         createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
    //         updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
    //         isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
    //         newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
    //         'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
    //     };
    //     const result = await act
    //         .runEvent('push', {
    //             workflowFile: path.join(repoPath, '.github', 'workflows'),
    //             mockSteps: testMockSteps,
    //             actor: 'Dummy Tester',
    //         });
    //     assertions.assertLintJobExecuted(result, false);
    //     assertions.assertTestJobExecuted(result, false);
    //     assertions.assertIsExpensifyEmployeeJobExecuted(result, false);
    //     assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
    //     assertions.assertChooseDeployActionsJobExecuted(result, false);
    //     assertions.assertSkipDeployJobExecuted(result, false);
    //     assertions.assertCreateNewVersionJobExecuted(result, false);
    //     assertions.assertUpdateStagingJobExecuted(result, false);
    // }, 60000);

    test('different event than push - workflow does not execute', async () => {
        const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new eAct.ExtendedAct(repoPath, workflowPath);
        const testMockSteps = {
            lint: mocks.LINT_JOB_MOCK_STEPS,
            test: mocks.TEST_JOB_MOCK_STEPS,
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
            newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
            'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
        };

        // pull_request
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {
                OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        let result = await act
            .runEvent('pull_request', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
            });
        assertions.assertLintJobExecuted(result, false);
        assertions.assertTestJobExecuted(result, false);
        assertions.assertIsExpensifyEmployeeJobExecuted(result, false);
        assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertions.assertChooseDeployActionsJobExecuted(result, false);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result, false);
        assertions.assertUpdateStagingJobExecuted(result, false);

        // workflow_dispatch
        act = utils.setUpActParams(
            act,
            'workflow_dispatch',
            {},
            {
                OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        result = await act
            .runEvent('workflow_dispatch', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
            });
        assertions.assertLintJobExecuted(result, false);
        assertions.assertTestJobExecuted(result, false);
        assertions.assertIsExpensifyEmployeeJobExecuted(result, false);
        assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertions.assertChooseDeployActionsJobExecuted(result, false);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result, false);
        assertions.assertUpdateStagingJobExecuted(result, false);
    }, 60000);

    describe('confirm passing build', () => {
        test('lint job failed - workflow exits', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: [
                    utils.getMockStep(
                        'Run lint workflow',
                        'Running lint workflow - Lint workflow failed',
                        'LINT',
                        null,
                        null,
                        null,
                        null,
                        false,
                    ),
                ],
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            expect(result).toEqual(expect.arrayContaining(
                [
                    utils.getStepAssertion(
                        'Run lint workflow',
                        false,
                        null,
                        'LINT',
                        'Running lint workflow - Lint workflow failed',
                    ),
                ],
            ));
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            expect(result).toEqual(expect.arrayContaining(
                [
                    utils.getStepAssertion(
                        'Announce failed workflow in Slack',
                        true,
                        null,
                        'CONFIRM_PASSING_BUILD',
                        'Announcing failed workflow in slack',
                        [{key: 'SLACK_WEBHOOK', value: '***'}],
                    ),
                    utils.getStepAssertion(
                        'Exit failed workflow',
                        false,
                        '',
                    ),
                ],
            ));
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result, false);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertUpdateStagingJobExecuted(result, false);
        }, 60000);

        test('test job failed - workflow exits', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: [
                    utils.getMockStep(
                        'Run test workflow',
                        'Running test workflow - Test workflow failed',
                        'TEST',
                        null,
                        null,
                        null,
                        null,
                        false,
                    ),
                ],
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            assertions.assertLintJobExecuted(result);
            expect(result).toEqual(expect.arrayContaining(
                [
                    utils.getStepAssertion(
                        'Run test workflow',
                        false,
                        null,
                        'TEST',
                        'Running test workflow - Test workflow failed',
                    ),
                ],
            ));
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            expect(result).toEqual(expect.arrayContaining(
                [
                    utils.getStepAssertion(
                        'Announce failed workflow in Slack',
                        true,
                        null,
                        'CONFIRM_PASSING_BUILD',
                        'Announcing failed workflow in slack',
                        [{key: 'SLACK_WEBHOOK', value: '***'}],
                    ),
                    utils.getStepAssertion(
                        'Exit failed workflow',
                        false,
                        '',
                    ),
                ],
            ));
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result, false);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertUpdateStagingJobExecuted(result, false);
        }, 60000);

        test('lint and test job succeed - workflow continues', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result);
            assertions.assertUpdateStagingJobExecuted(result);
        }, 60000);
    });

    describe('new contributor welcome message', () => {
        test('actor is OSBotify - no comment left', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__OSBOTIFY,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertNewContributorWelcomeMessageJobExecuted(result, false);
        }, 60000);

        test('actor is Expensify employee - no comment left', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertNewContributorWelcomeMessageJobExecuted(result, false);
        }, 60000);

        test('actor is not Expensify employee, its not their first PR - job triggers, but no comment left', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertNewContributorWelcomeMessageJobExecuted(result, true, false, false);
        }, 60000);

        test('actor is not Expensify employee, and its their first PR - job triggers and comment left', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__ONE_PR,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertNewContributorWelcomeMessageJobExecuted(result, true, false, true);
        }, 60000);
    });

    describe('choose deploy actions', () => {
        describe('no CP label', () => {
            describe('staging locked', () => {
                test('not automated PR - deploy skipped and comment left', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook'},
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Tester',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result);
                    assertions.assertCreateNewVersionJobExecuted(result, false);
                    assertions.assertUpdateStagingJobExecuted(result, false, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);

                test('automated PR - deploy skipped, but no comment left', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook'},
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__OSBOTIFY,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result, false);
                    assertions.assertUpdateStagingJobExecuted(result, false, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);
            });

            describe('staging not locked', () => {
                test('not automated PR - proceed with deploy', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Tester',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result);
                    assertions.assertUpdateStagingJobExecuted(result, true, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);

                test('automated PR - deploy skipped, but no comment left', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__OSBOTIFY,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result, false);
                    assertions.assertUpdateStagingJobExecuted(result, false, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);
            });
        });

        describe('CP label', () => {
            describe('staging locked', () => {
                test('not automated PR - proceed with deploy', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_LOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Tester',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result);
                    assertions.assertUpdateStagingJobExecuted(result, true, true);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);

                test('automated PR - proceed with deploy', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_LOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result);
                    assertions.assertUpdateStagingJobExecuted(result, true, true);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);
            });

            describe('staging not locked', () => {
                test('not automated PR - proceed with deploy', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Tester',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result);
                    assertions.assertUpdateStagingJobExecuted(result, true, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);

                test('automated PR - proceed with deploy', async () => {
                    const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(
                        act,
                        'push',
                        {ref: 'refs/heads/main'},
                        {
                            OS_BOTIFY_TOKEN: 'dummy_token',
                            SLACK_WEBHOOK: 'dummy_slack_webhook',
                            LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                        },
                        'dummy_github_token',
                    );
                    const testMockSteps = {
                        lint: mocks.LINT_JOB_MOCK_STEPS,
                        test: mocks.TEST_JOB_MOCK_STEPS,
                        confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                        chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                        skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                        createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                        isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                        newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                        'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
                    };
                    const result = await act
                        .runEvent('push', {
                            workflowFile: path.join(repoPath, '.github', 'workflows'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                        });
                    assertions.assertLintJobExecuted(result);
                    assertions.assertTestJobExecuted(result);
                    assertions.assertIsExpensifyEmployeeJobExecuted(result);
                    assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
                    assertions.assertChooseDeployActionsJobExecuted(result);
                    assertions.assertSkipDeployJobExecuted(result, false);
                    assertions.assertCreateNewVersionJobExecuted(result);
                    assertions.assertUpdateStagingJobExecuted(result, true, false);
                    assertions.assertUpdateStagingJobFailed(result, false);
                }, 60000);
            });
        });

        test('one of updateStaging steps failed - failure announced in Slack', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {ref: 'refs/heads/main'},
                {
                    OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                lint: mocks.LINT_JOB_MOCK_STEPS,
                test: mocks.TEST_JOB_MOCK_STEPS,
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                createNewVersion: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                isExpensifyEmployee: mocks.IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
                newContributorWelcomeMessage: mocks.NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
                'e2e-tests': mocks.E2E_TESTS_JOB_MOCK_STEPS,
            };
            testMockSteps.updateStaging[3].mockWith = 'exit 1';
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                });
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertIsExpensifyEmployeeJobExecuted(result);
            assertions.assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result);
            assertions.assertUpdateStagingJobFailed(result, true);
        }, 60000);
    });
});
