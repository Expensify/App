const core = require('@actions/core');
const run = require('../../.github/actions/isStagingDeployLocked/isStagingDeployLocked');

beforeEach(() => {
    jest.resetModules();
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

afterEach(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
});

describe('isStagingDeployLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Test returning empty result', () => {
            jest.mock('../../.github/libs/GithubUtils', () => jest.fn().mockImplementation(() => (
                {getStagingDeployCash: jest.fn().mockResolvedValue({data: [{}]})}
            )));

            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
            });
        });

        test('Test returning valid locked issue', () => {
            const mockIssue = {
                url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
                title: 'Andrew Test Issue',
                labels: [
                    {
                        id: 2783847782,
                        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                        url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                        name: '🔐 LockCashDeploys 🔐',
                        color: '6FC269',
                        default: false,
                        description: '',
                    },
                ],
                body: '**Release Version:** `1.0.1-47`',
            };

            jest.mock('../../.github/libs/GithubUtils', () => jest.fn().mockImplementation(() => (
                {getStagingDeployCash: jest.fn().mockResolvedValue({data: [mockIssue]})}
            )));

            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
