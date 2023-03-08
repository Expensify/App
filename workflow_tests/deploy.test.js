const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/deployAssertions');
const mocks = require('./mocks/deployMocks');
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'deploy.yml'),
        dest: '.github/workflows/deploy.yml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testDeployWorkflowRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
                pushedBranches: ['staging', 'production'],
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test workflow deploy', () => {
    describe('push as OSBotify', () => {
        test('to main - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/main',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE__OSBOTIFY__STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to staging - deployStaging triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/staging',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE__OSBOTIFY__STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to production - deployProduction triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/production',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE__OSBOTIFY__STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result);
        }, 60000);
    });
    describe('push as user', () => {
        test('to main - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/main',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE_STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to staging - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/staging',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE_STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to production - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/production',
                },
                {
                    OS_BOTIFY_TOKEN: 'dummy_token',
                    LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                },
                'dummy_github_token',
            );
            const testMockSteps = {
                validate: mocks.VALIDATE_STEP_MOCKS,
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act
                .runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Author',
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);
    });

    test('different event than push - workflow does not execute', async () => {
        const repoPath = mockGithub.repo.getPath('testdeployWorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
        let act = new eAct.ExtendedAct(repoPath, workflowPath);
        const testMockSteps = {
            validate: mocks.VALIDATE__OSBOTIFY__STEP_MOCKS,
            deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
            deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
        };

        // pull_request
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {
                OS_BOTIFY_TOKEN: 'dummy_token',
                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        let result = await act
            .runEvent('pull_request', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
                actor: 'Dummy Author',
            });
        assertions.assertValidateJobExecuted(result, false);
        assertions.assertDeployStagingJobExecuted(result, false);
        assertions.assertDeployProductionJobExecuted(result, false);

        // workflow_dispatch
        act = utils.setUpActParams(
            act,
            'workflow_dispatch',
            {},
            {
                OS_BOTIFY_TOKEN: 'dummy_token',
                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        result = await act
            .runEvent('workflow_dispatch', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
                actor: 'Dummy Author',
            });
        assertions.assertValidateJobExecuted(result, false);
        assertions.assertDeployStagingJobExecuted(result, false);
        assertions.assertDeployProductionJobExecuted(result, false);
    }, 60000);
});
