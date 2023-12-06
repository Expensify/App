const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/deployAssertions');
const mocks = require('./mocks/deployMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'deploy.yml'),
        dest: '.github/workflows/deploy.yml',
    },
];

describe('test workflow deploy', () => {
    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

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

    const secrets = {
        OS_BOTIFY_TOKEN: 'dummy_token',
        LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
        OS_BOTIFY_APP_ID: 'os_botify_app_id',
        OS_BOTIFY_PRIVATE_KEY: 'os_botify_private_key',
    };
    describe('push', () => {
        it('to main - nothing triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/main',
                },
                secrets,
                'dummy_github_token',
            );
            const testMockSteps = {
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'deploy.yml'),
                mockSteps: testMockSteps,
                actor: 'OSBotify',
                logFile: utils.getLogFilePath('deploy', expect.getState().currentTestName),
            });
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result, false);
        });

        it('to staging - deployStaging triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/staging',
                },
                secrets,
                'dummy_github_token',
            );
            const testMockSteps = {
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'deploy.yml'),
                mockSteps: testMockSteps,
                actor: 'OSBotify',
                logFile: utils.getLogFilePath('deploy', expect.getState().currentTestName),
            });
            assertions.assertDeployStagingJobExecuted(result);
            assertions.assertDeployProductionJobExecuted(result, false);
        });

        it('to production - deployProduction triggered', async () => {
            const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                'push',
                {
                    ref: 'refs/heads/production',
                },
                secrets,
                'dummy_github_token',
            );
            const testMockSteps = {
                deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
                deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'deploy.yml'),
                mockSteps: testMockSteps,
                actor: 'OSBotify',
                logFile: utils.getLogFilePath('deploy', expect.getState().currentTestName),
            });
            assertions.assertDeployStagingJobExecuted(result, false);
            assertions.assertDeployProductionJobExecuted(result);
        });
    });

    it('different event than push - workflow does not execute', async () => {
        const repoPath = mockGithub.repo.getPath('testDeployWorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'deploy.yml');
        let act = new eAct.ExtendedAct(repoPath, workflowPath);
        const testMockSteps = {
            deployStaging: mocks.DEPLOY_STAGING_STEP_MOCKS,
            deployProduction: mocks.DEPLOY_PRODUCTION_STEP_MOCKS,
        };

        // pull_request
        act = utils.setUpActParams(act, 'pull_request', {head: {ref: 'main'}}, secrets, 'dummy_github_token');
        let result = await act.runEvent('pull_request', {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'deploy.yml'),
            mockSteps: testMockSteps,
            actor: 'Dummy Author',
            logFile: utils.getLogFilePath('deploy', expect.getState().currentTestName),
        });
        assertions.assertDeployStagingJobExecuted(result, false);
        assertions.assertDeployProductionJobExecuted(result, false);

        // workflow_dispatch
        act = utils.setUpActParams(act, 'workflow_dispatch', {}, secrets, 'dummy_github_token');
        result = await act.runEvent('workflow_dispatch', {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'deploy.yml'),
            mockSteps: testMockSteps,
            actor: 'Dummy Author',
            logFile: utils.getLogFilePath('deploy', expect.getState().currentTestName),
        });
        assertions.assertDeployStagingJobExecuted(result, false);
        assertions.assertDeployProductionJobExecuted(result, false);
    });
});
