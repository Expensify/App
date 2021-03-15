const core = require('@actions/core');
const run = require('../../.github/actions/isStagingDeployLocked/isStagingDeployLocked');

beforeEach(() => {
    jest.resetModules();

    // Mock GITHUB_TOKEN which is required before every test
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

afterEach(() => {
    // Remove mock GITHUB_TOKEN after every test
    delete process.env.INPUT_GITHUB_TOKEN;
});

// Our mock function that we can adjust in each test
let mockGetStagingDeployCash = jest.fn();

// Mock the entire GitHubUtils module
jest.mock('../../.github/libs/GithubUtils', () => jest.fn().mockImplementation(() => ({
    getStagingDeployCash: mockGetStagingDeployCash,
})));

describe('isStagingDeployLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Test returning empty result', () => {
            // Mock the return value of GitHubUtils.getStagingDeployCash() to return an empty object
            mockGetStagingDeployCash = jest.fn().mockResolvedValue({});
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
            mockGetStagingDeployCash = jest.fn().mockResolvedValue(mockData);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
