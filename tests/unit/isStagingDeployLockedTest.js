const core = require('@actions/core');
const run = require('../../.github/actions/isStagingDeployLocked/isStagingDeployLocked');

beforeEach(() => {
    jest.resetModules();
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

afterEach(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
});

const mockData = {
    comparisonURL: 'https://github.com/Expensify/Expensify.cash/compare/1.0.1-0...1.0.1-47',
    labels: [
        {
            color: '6FC269',
            default: false,
            description: '',
            id: 2783847782,
            name: '🔐 LockCashDeploys 🔐',
            node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
        },
    ],
    tag: '1.0.1-47',
    title: 'Andrew Test Issue',
    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
};

let mockGetStagingDeployCash = jest.fn();

// eslint-disable-next-line arrow-body-style
jest.mock('../../.github/libs/GithubUtils', () => {
    // eslint-disable-next-line arrow-body-style
    return jest.fn().mockImplementation(() => {
        return {
            getStagingDeployCash: mockGetStagingDeployCash,
        };
    });
});

describe('isStagingDeployLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Test returning empty result', () => {
            mockGetStagingDeployCash = jest.fn().mockResolvedValue({});
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
            });
        });

        test('Test returning valid locked issue', () => {
            mockGetStagingDeployCash = jest.fn().mockResolvedValue(mockData);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isStagingDeployLocked = run();
            return isStagingDeployLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
