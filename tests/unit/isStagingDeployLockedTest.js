const core = require('@actions/core');
const run = require('../../.github/actions/isStagingDeployLocked/isStagingDeployLocked');
const GithubUtils = require('../../.github/libs/GithubUtils');

// Mock the entire GitHubUtils module
jest.mock('../../.github/libs/GithubUtils');
beforeAll(() => {
    // Mock required GITHUB_TOKEN
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    // Reset mocks before each test
    jest.resetModules();
});

afterAll(() => {
    // Remove mock GITHUB_TOKEN
    delete process.env.INPUT_GITHUB_TOKEN;
});

describe('isStagingDeployLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Test returning empty result', () => {
            // Mock the return value of GitHubUtils.getStagingDeployCash() to return an empty object
            GithubUtils.getStagingDeployCash = jest.fn().mockResolvedValue({});
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
            });
        });

        test('Test returning valid locked issue', () => {
            // Mocking the minimum amount of data required for a found issue with the correct label
            const mockData = {
                labels: [{name: '🔐 LockCashDeploys 🔐'}],
            };

            // Mock the return value of GitHubUtils.getStagingDeployCash() to return the correct label
            GithubUtils.getStagingDeployCash = jest.fn().mockResolvedValue(mockData);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
