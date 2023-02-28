const path = require('path');
const kieActJs = require('@kie/act-js');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils');
const assertions = require('./assertions/deployAssertions');
const mocks = require('./mocks/deployMocks');

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
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/main',
                },
                {
                    GITHUB_ACTOR: 'OSBotify',
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
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to staging - deployStaging triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/staging',
                },
                {
                    GITHUB_ACTOR: 'OSBotify',
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
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to production - deployProduction triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/production',
                },
                {
                    GITHUB_ACTOR: 'OSBotify',
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
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/main',
                },
                {
                    GITHUB_ACTOR: 'Dummy Author',
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
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to staging - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/staging',
                },
                {
                    GITHUB_ACTOR: 'Dummy Author',
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
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);

        test('to production - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new kieActJs.Act(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/production',
                },
                {
                    GITHUB_ACTOR: 'Dummy Author',
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
                });
            assertions.assertValidateJobExecuted(result);
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        }, 60000);
    });
});
