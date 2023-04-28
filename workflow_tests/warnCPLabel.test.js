const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/warnCPLabelAssertions');
const mocks = require('./mocks/warnCPLabelMocks');
const eAct = require('./utils/ExtendedAct');

jest.setTimeout(60 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'warnCPLabel.yml'),
        dest: '.github/workflows/warnCPLabel.yml',
    },
];

describe('test workflow warnCPLabel', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';
    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testWarnCPLabelWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('pull request target labeled', () => {
        const event = 'pull_request_target';
        const eventOptions = {
            action: 'labeled',
            label: {
                name: 'CP Staging',
            },
        };
        const secrets = {
            SLACK_WEBHOOK: 'dummy_slack_webhook',
        };
        it('executes workflow', async () => {
            const repoPath = mockGithub.repo.getPath('testWarnCPLabelWorkflowRepo') || '';
            const workflowPath = path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml');
            let act = new eAct.ExtendedAct(repoPath, workflowPath);
            act = utils.setUpActParams(
                act,
                event,
                eventOptions,
                secrets,
                githubToken,
            );
            const testMockSteps = {
                warnCPLabel: mocks.WARNCPLABEL__WARNCPLABEL__STEP_MOCKS,
            };
            const result = await act
                .runEvent(event, {
                    workflowFile: path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml'),
                    mockSteps: testMockSteps,
                    actor,
                    logFile: utils.getLogFilePath('warnCPLabel'),
                });

            assertions.assertWarnCPLabelJobExecuted(result);
        });
        describe('first step fails', () => {
            it('executes workflow, announces failure on Slack', async () => {
                const repoPath = mockGithub.repo.getPath('testWarnCPLabelWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    eventOptions,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    warnCPLabel: utils.deepCopy(mocks.WARNCPLABEL__WARNCPLABEL__STEP_MOCKS),
                };
                testMockSteps.warnCPLabel[0] = utils.createMockStep(
                    'Comment on PR to explain the CP Staging label',
                    'Comment on PR to explain the CP Staging label',
                    'WARNCPLABEL',
                    ['github_token'],
                    [],
                    {},
                    {},
                    false,
                );
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml'),
                        mockSteps: testMockSteps,
                        actor,
                        logFile: utils.getLogFilePath('warnCPLabel'),
                    });

                assertions.assertWarnCPLabelJobExecuted(result, true, false);
            });
        });
        describe('label different than CP Staging', () => {
            const differentEventOptions = {
                action: 'labeled',
                label: {
                    name: 'Some Different Label',
                },
            };
            it('does not execute workflow', async () => {
                const repoPath = mockGithub.repo.getPath('testWarnCPLabelWorkflowRepo') || '';
                const workflowPath = path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml');
                let act = new eAct.ExtendedAct(repoPath, workflowPath);
                act = utils.setUpActParams(
                    act,
                    event,
                    differentEventOptions,
                    secrets,
                    githubToken,
                );
                const testMockSteps = {
                    warnCPLabel: mocks.WARNCPLABEL__WARNCPLABEL__STEP_MOCKS,
                };
                const result = await act
                    .runEvent(event, {
                        workflowFile: path.join(repoPath, '.github', 'workflows', 'warnCPLabel.yml'),
                        mockSteps: testMockSteps,
                        actor,
                        logFile: utils.getLogFilePath('warnCPLabel'),
                    });

                assertions.assertWarnCPLabelJobExecuted(result, false);
            });
        });
    });
});
