"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment node
 */
var core = require("@actions/core");
var isStagingDeployLocked_1 = require("../../.github/actions/javascript/isStagingDeployLocked/isStagingDeployLocked");
var GithubUtils_1 = require("../../.github/libs/GithubUtils");
// Mock the entire GithubUtils module
jest.mock('../../.github/libs/GithubUtils');
beforeAll(function () {
    // Mock required GITHUB_TOKEN
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});
beforeEach(function () {
    // Reset mocks before each test
    jest.resetModules();
});
afterAll(function () {
    // Remove mock GITHUB_TOKEN
    delete process.env.INPUT_GITHUB_TOKEN;
});
describe('isStagingDeployLockedTest', function () {
    describe('GitHub action run function', function () {
        test('Test returning empty result', function () {
            // Mock the return value of GithubUtils.getStagingDeployCash() to return an empty object
            GithubUtils_1.default.getStagingDeployCash = jest.fn().mockResolvedValue({});
            var setOutputMock = jest.spyOn(core, 'setOutput');
            var isStagingDeployLocked = (0, isStagingDeployLocked_1.default)();
            return isStagingDeployLocked.then(function () {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
            });
        });
        test('Test returning valid locked issue', function () {
            // Mocking the minimum amount of data required for a found issue with the correct label
            var mockData = {
                labels: [{ name: '🔐 LockCashDeploys 🔐' }],
            };
            // Mock the return value of GithubUtils.getStagingDeployCash() to return the correct label
            GithubUtils_1.default.getStagingDeployCash = jest.fn().mockResolvedValue(mockData);
            var setOutputMock = jest.spyOn(core, 'setOutput');
            var isStagingDeployLocked = (0, isStagingDeployLocked_1.default)();
            return isStagingDeployLocked.then(function () {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
