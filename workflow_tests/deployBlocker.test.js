const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/deployBlockerAssertions');
const mocks = require('./mocks/deployBlockerMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'deployBlocker.yml'),
        dest: '.github/workflows/deployBlocker.yml',
    },
];

describe('test workflow deployBlocker', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Author';
    const secrets = {
        OS_BOTIFY_TOKEN: 'dummy_osbotify_token',
        SLACK_WEBHOOK: 'dummy_slack_webhook',
    };

    beforeAll(async () => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testDeployBlockerWorkflowRepo: {
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
    describe('issue labeled', () => {
        const event = 'issues';
        const eventOptions = {
            action: 'labeled',
            label: {
                name: 'DeployBlockerCash',
            },
            issue: {
                title: 'Labeled issue title',
                number: '1234',
                html_url: 'http://issue.html.url',
            },
        };
        describe('label is DeployBlockerCash', () => {
            const testEventOptions = utils.deepCopy(eventOptions);
            testEventOptions.label = {name: 'DeployBlockerCash'};
            it('runs the workflow and announces success on Slack', async () => {
                const repoPath = mockGithub.repo.getPath('testDeployBlockerWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, testEventOptions, secrets, githubToken, {}, {});
                const testMockSteps = {
                    deployBlocker: mocks.DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS,
                };
                const testMockJobs = {
                    updateChecklist: {
                        steps: mocks.DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCKS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('deployBlocker', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });

                assertions.assertUpdateChecklistJobExecuted(result);
                assertions.assertDeployBlockerJobExecuted(result);
            });
            describe('one step fails', () => {
                it('announces failure on Slack', async () => {
                    const repoPath = mockGithub.repo.getPath('testDeployBlockerWorkflowRepo') || '';
                    const workflowPath = path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml');
                    let act = new eAct.ExtendedAct(repoPath, workflowPath);
                    act = utils.setUpActParams(act, event, testEventOptions, secrets, githubToken, {}, {});
                    const testMockSteps = {
                        deployBlocker: utils.deepCopy(mocks.DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS),
                    };
                    testMockSteps.deployBlocker[1] = utils.createMockStep(
                        'Give the issue/PR the Hourly, Engineering labels',
                        'Give the issue/PR the Hourly, Engineering labels',
                        'DEPLOYBLOCKER',
                        [],
                        ['GITHUB_TOKEN'],
                        null,
                        null,
                        false,
                    );
                    const testMockJobs = {
                        updateChecklist: {
                            steps: mocks.DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCKS,
                            runsOn: 'ubuntu-latest',
                        },
                    };
                    const result = await act.runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml'),
                        mockSteps: testMockSteps,
                        actor,
                        logFile: utils.getLogFilePath('deployBlocker', expect.getState().currentTestName),
                        mockJobs: testMockJobs,
                    });

                    assertions.assertUpdateChecklistJobExecuted(result);
                    assertions.assertDeployBlockerJobExecuted(result, true, false, 1);
                });
            });
        });
        describe('label is different', () => {
            const testEventOptions = utils.deepCopy(eventOptions);
            testEventOptions.label = {name: 'Different Label'};
            it('does not run workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testDeployBlockerWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(act, event, testEventOptions, secrets, githubToken, {}, {});
                const testMockSteps = {
                    deployBlocker: mocks.DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS,
                };
                const testMockJobs = {
                    updateChecklist: {
                        steps: mocks.DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCKS,
                        runsOn: 'ubuntu-latest',
                    },
                };
                const result = await act.runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'deployBlocker.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('deployBlocker', expect.getState().currentTestName),
                    mockJobs: testMockJobs,
                });

                assertions.assertUpdateChecklistJobExecuted(result, false);
                assertions.assertDeployBlockerJobExecuted(result, false);
            });
        });
    });
});
