import type {MockStep} from '@kie/act-js';
import {MockGithub} from '@kie/mock-github';
import type {CreateRepositoryFile} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/preDeployAssertions';
import mocks from './mocks/preDeployMocks';
import ExtendedAct from './utils/ExtendedAct';
import type {MockJobs} from './utils/JobMocker';
import * as utils from './utils/utils';

jest.setTimeout(90 * 1000);

let mockGithub: MockGithub;

const FILES_TO_COPY_INTO_TEST_REPO: CreateRepositoryFile[] = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'preDeploy.yml'),
        dest: '.github/workflows/preDeploy.yml',
    },
];

describe('test workflow preDeploy', () => {
    beforeAll(() => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new MockGithub({
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
    it('push to main - workflow executes', async () => {
        // get path to the local test repo
        const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';

        // get path to the workflow file under test
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

        // instantiate Act in the context of the test repo and given workflow file
        let act = new ExtendedAct(repoPath, workflowPath);

        // set run parameters
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

        // set up mocks
        const testMockSteps: MockStep = {
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
        };
        const testMockJobs: MockJobs = {
            typecheck: {
                steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            lint: {
                steps: mocks.LINT_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            test: {
                steps: mocks.TEST_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            createNewVersion: {
                steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                outputs: {
                    // eslint-disable-next-line no-template-curly-in-string
                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                },
                runsOn: 'ubuntu-latest',
            },
            e2ePerformanceTests: {
                steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
        };

        // run an event and get the result
        const result = await act.runEvent('push', {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
            mockSteps: testMockSteps,
            actor: 'Dummy Tester',
            logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
            mockJobs: testMockJobs,
        });

        // assert results (some steps can run in parallel to each other so the order is not assured
        // therefore we can check which steps have been executed, but not the set job order
        assertions.assertTypecheckJobExecuted(result);
        assertions.assertLintJobExecuted(result);
        assertions.assertTestJobExecuted(result);
        assertions.assertChooseDeployActionsJobExecuted(result);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result);
        assertions.assertUpdateStagingJobExecuted(result);
    });

    it('different event than push - workflow does not execute', async () => {
        const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new ExtendedAct(repoPath, workflowPath);
        const testMockSteps: MockStep = {
            confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
            skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
            updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
        };
        const testMockJobs: MockJobs = {
            typecheck: {
                steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            lint: {
                steps: mocks.LINT_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            test: {
                steps: mocks.TEST_JOB_MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
            createNewVersion: {
                steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                outputs: {
                    // eslint-disable-next-line no-template-curly-in-string
                    NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                },
                runsOn: 'ubuntu-latest',
            },
            e2ePerformanceTests: {
                steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                runsOn: 'ubuntu-latest',
            },
        };

        // pull_request
        act = utils.setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            {
                OS_BOTIFY_TOKEN: 'dummy_token',
                SLACK_WEBHOOK: 'dummy_slack_webhook',
                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        let result = await act.runEvent('pull_request', {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
            mockSteps: testMockSteps,
            actor: 'Dummy Tester',
            logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
            mockJobs: testMockJobs,
        });
        assertions.assertTypecheckJobExecuted(result, false);
        assertions.assertLintJobExecuted(result, false);
        assertions.assertTestJobExecuted(result, false);
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
                OS_BOTIFY_TOKEN: 'dummy_token',
                SLACK_WEBHOOK: 'dummy_slack_webhook',
                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
            },
            'dummy_github_token',
        );
        result = await act.runEvent('workflow_dispatch', {
            workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
            mockSteps: testMockSteps,
            actor: 'Dummy Tester',
            logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
            mockJobs: testMockJobs,
        });
        assertions.assertTypecheckJobExecuted(result, false);
        assertions.assertLintJobExecuted(result, false);
        assertions.assertTestJobExecuted(result, false);
        assertions.assertChooseDeployActionsJobExecuted(result, false);
        assertions.assertSkipDeployJobExecuted(result, false);
        assertions.assertCreateNewVersionJobExecuted(result, false);
        assertions.assertUpdateStagingJobExecuted(result, false);
    });

    describe('confirm passing build', () => {
        it('typecheck job failed - workflow exits', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
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
            const testMockSteps: MockStep = {
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            };
            const testMockJobs: MockJobs = {
                typecheck: {
                    steps: [utils.createMockStep('Run typecheck workflow', 'Running typecheck workflow - Typecheck workflow failed', 'TYPECHECK', null, null, null, null, false)],
                    runsOn: 'ubuntu-latest',
                },
                lint: {
                    steps: mocks.LINT_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                test: {
                    steps: mocks.TEST_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                createNewVersion: {
                    steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
                e2ePerformanceTests: {
                    steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
                logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });
            expect(result).toEqual(
                expect.arrayContaining([utils.createStepAssertion('Run typecheck workflow', false, null, 'TYPECHECK', 'Running typecheck workflow - Typecheck workflow failed')]),
            );
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            expect(result).toEqual(
                expect.arrayContaining([
                    utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'CONFIRM_PASSING_BUILD', 'Announcing failed workflow in slack', [
                        {key: 'SLACK_WEBHOOK', value: '***'},
                    ]),
                    utils.createStepAssertion('Exit failed workflow', false, 'Checks failed, exiting ~ typecheck: failure, lint: success, test: success'),
                ]),
            );
            assertions.assertChooseDeployActionsJobExecuted(result, false);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertUpdateStagingJobExecuted(result, false);
        });

        it('lint job failed - workflow exits', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
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
            const testMockSteps: MockStep = {
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            };
            const testMockJobs: MockJobs = {
                typecheck: {
                    steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                lint: {
                    steps: [utils.createMockStep('Run lint workflow', 'Running lint workflow - Lint workflow failed', 'LINT', null, null, null, null, false)],
                    runsOn: 'ubuntu-latest',
                },
                test: {
                    steps: mocks.TEST_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                createNewVersion: {
                    steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
                e2ePerformanceTests: {
                    steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
                logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });
            assertions.assertTypecheckJobExecuted(result);
            expect(result).toEqual(expect.arrayContaining([utils.createStepAssertion('Run lint workflow', false, null, 'LINT', 'Running lint workflow - Lint workflow failed')]));
            assertions.assertTestJobExecuted(result);
            expect(result).toEqual(
                expect.arrayContaining([
                    utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'CONFIRM_PASSING_BUILD', 'Announcing failed workflow in slack', [
                        {key: 'SLACK_WEBHOOK', value: '***'},
                    ]),
                    utils.createStepAssertion('Exit failed workflow', false, 'Checks failed, exiting ~ typecheck: success, lint: failure, test: success'),
                ]),
            );
            assertions.assertChooseDeployActionsJobExecuted(result, false);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertUpdateStagingJobExecuted(result, false);
        });

        it('test job failed - workflow exits', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
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
            const testMockSteps: MockStep = {
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            };
            const testMockJobs: MockJobs = {
                typecheck: {
                    steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                lint: {
                    steps: mocks.LINT_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                test: {
                    steps: [utils.createMockStep('Run test workflow', 'Running test workflow - Test workflow failed', 'TEST', null, null, null, null, false)],
                    runsOn: 'ubuntu-latest',
                },
                createNewVersion: {
                    steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
                e2ePerformanceTests: {
                    steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
                logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });
            assertions.assertTypecheckJobExecuted(result);
            assertions.assertLintJobExecuted(result);
            expect(result).toEqual(expect.arrayContaining([utils.createStepAssertion('Run test workflow', false, null, 'TEST', 'Running test workflow - Test workflow failed')]));
            expect(result).toEqual(
                expect.arrayContaining([
                    utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'CONFIRM_PASSING_BUILD', 'Announcing failed workflow in slack', [
                        {key: 'SLACK_WEBHOOK', value: '***'},
                    ]),
                    utils.createStepAssertion('Exit failed workflow', false, 'Checks failed, exiting ~ typecheck: success, lint: success, test: failure'),
                ]),
            );
            assertions.assertChooseDeployActionsJobExecuted(result, false);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result, false);
            assertions.assertUpdateStagingJobExecuted(result, false);
        });

        it('lint and test job succeed - workflow continues', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
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
            const testMockSteps: MockStep = {
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            };
            const testMockJobs: MockJobs = {
                typecheck: {
                    steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                lint: {
                    steps: mocks.LINT_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                test: {
                    steps: mocks.TEST_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                createNewVersion: {
                    steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
                e2ePerformanceTests: {
                    steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
                logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });
            assertions.assertTypecheckJobExecuted(result);
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result);
            assertions.assertUpdateStagingJobExecuted(result);
        });
    });

    describe('choose deploy actions', () => {
        describe('staging locked', () => {
            it('not automated PR - deploy skipped and comment left', async () => {
                const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, 'push', {ref: 'refs/heads/main'}, {OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook'}, 'dummy_github_token');
                const testMockSteps: MockStep = {
                    confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                    chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED,
                    skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                    updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                };
                const testMockJobs: MockJobs = {
                    typecheck: {
                        steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    lint: {
                        steps: mocks.LINT_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    test: {
                        steps: mocks.TEST_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    createNewVersion: {
                        steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                    e2ePerformanceTests: {
                        steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                    logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });
                assertions.assertTypecheckJobExecuted(result);
                assertions.assertLintJobExecuted(result);
                assertions.assertTestJobExecuted(result);
                assertions.assertChooseDeployActionsJobExecuted(result);
                assertions.assertSkipDeployJobExecuted(result);
                assertions.assertCreateNewVersionJobExecuted(result, false);
                assertions.assertUpdateStagingJobExecuted(result, false);
                assertions.assertUpdateStagingJobFailed(result, false);
            });

            it('automated PR - deploy skipped, but no comment left', async () => {
                const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, 'push', {ref: 'refs/heads/main'}, {OS_BOTIFY_TOKEN: 'dummy_token', SLACK_WEBHOOK: 'dummy_slack_webhook'}, 'dummy_github_token');
                const testMockSteps: MockStep = {
                    confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                    chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED,
                    skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                    updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                };
                const testMockJobs: MockJobs = {
                    typecheck: {
                        steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    lint: {
                        steps: mocks.LINT_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    test: {
                        steps: mocks.TEST_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    createNewVersion: {
                        steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                    e2ePerformanceTests: {
                        steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                    logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });
                assertions.assertTypecheckJobExecuted(result);
                assertions.assertLintJobExecuted(result);
                assertions.assertTestJobExecuted(result);
                assertions.assertChooseDeployActionsJobExecuted(result);
                assertions.assertSkipDeployJobExecuted(result, false);
                assertions.assertCreateNewVersionJobExecuted(result, false);
                assertions.assertUpdateStagingJobExecuted(result, false);
                assertions.assertUpdateStagingJobFailed(result, false);
            });
        });

        describe('staging not locked', () => {
            it('not automated PR - proceed with deploy', async () => {
                const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
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
                const testMockSteps: MockStep = {
                    confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                    chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                    skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                    updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                };
                const testMockJobs: MockJobs = {
                    typecheck: {
                        steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    lint: {
                        steps: mocks.LINT_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    test: {
                        steps: mocks.TEST_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    createNewVersion: {
                        steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                    e2ePerformanceTests: {
                        steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                    mockSteps: testMockSteps,
                    actor: 'Dummy Tester',
                    logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });
                assertions.assertTypecheckJobExecuted(result);
                assertions.assertLintJobExecuted(result);
                assertions.assertTestJobExecuted(result);
                assertions.assertChooseDeployActionsJobExecuted(result);
                assertions.assertSkipDeployJobExecuted(result, false);
                assertions.assertCreateNewVersionJobExecuted(result);
                assertions.assertUpdateStagingJobExecuted(result, true);
                assertions.assertUpdateStagingJobFailed(result, false);
            });

            it('automated PR - deploy skipped, but no comment left', async () => {
                const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
                let act = new ExtendedAct(repoPath, workflowPath);
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
                const testMockSteps: MockStep = {
                    confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                    chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                    skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                    updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
                };
                const testMockJobs: MockJobs = {
                    typecheck: {
                        steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    lint: {
                        steps: mocks.LINT_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    test: {
                        steps: mocks.TEST_JOB_MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                    createNewVersion: {
                        steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                        outputs: {
                            // eslint-disable-next-line no-template-curly-in-string
                            NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                        },
                        runsOn: 'ubuntu-latest',
                    },
                    e2ePerformanceTests: {
                        steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent('push', {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                    mockSteps: testMockSteps,
                    actor: 'OSBotify',
                    logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });
                assertions.assertTypecheckJobExecuted(result);
                assertions.assertLintJobExecuted(result);
                assertions.assertTestJobExecuted(result);
                assertions.assertChooseDeployActionsJobExecuted(result);
                assertions.assertSkipDeployJobExecuted(result, false);
                assertions.assertCreateNewVersionJobExecuted(result, false);
                assertions.assertUpdateStagingJobExecuted(result, false);
                assertions.assertUpdateStagingJobFailed(result, false);
            });
        });

        it('one of updateStaging steps failed - failure announced in Slack', async () => {
            const repoPath = mockGithub.repo.getPath('testPreDeployWorkflowRepo') ?? '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
            let act = new ExtendedAct(repoPath, workflowPath);
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
            const testMockSteps: MockStep = {
                confirmPassingBuild: mocks.CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
                chooseDeployActions: mocks.CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
                skipDeploy: mocks.SKIP_DEPLOY_JOB_MOCK_STEPS,
                updateStaging: mocks.UPDATE_STAGING_JOB_MOCK_STEPS,
            };
            testMockSteps.updateStaging[3].mockWith = 'exit 1';
            const testMockJobs: MockJobs = {
                typecheck: {
                    steps: mocks.TYPECHECK_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                lint: {
                    steps: mocks.LINT_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                test: {
                    steps: mocks.TEST_JOB_MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
                createNewVersion: {
                    steps: mocks.CREATE_NEW_VERSION_JOB_MOCK_STEPS,
                    outputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        NEW_VERSION: '${{ steps.createNewVersion.outputs.NEW_VERSION }}',
                    },
                    runsOn: 'ubuntu-latest',
                },
                e2ePerformanceTests: {
                    steps: mocks.PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
                    runsOn: 'ubuntu-latest',
                },
            };
            const result = await act.runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows', 'preDeploy.yml'),
                mockSteps: testMockSteps,
                actor: 'Dummy Tester',
                logFile: utils.getLogFilePath('preDeploy', expect.getState().currentTestName),
                mockJobs: testMockJobs,
            });
            assertions.assertTypecheckJobExecuted(result);
            assertions.assertLintJobExecuted(result);
            assertions.assertTestJobExecuted(result);
            assertions.assertChooseDeployActionsJobExecuted(result);
            assertions.assertSkipDeployJobExecuted(result, false);
            assertions.assertCreateNewVersionJobExecuted(result);
            assertions.assertUpdateStagingJobFailed(result, true);
        });
    });
});
