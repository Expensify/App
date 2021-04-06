const core = require('@actions/core');
const github = require('@actions/github');
const run = require('../../.github/actions/checkForAutomergePullRequests/checkForAutomergePullRequests');

// Static mock function for core.getInput
const mockGetInput = jest.fn().mockImplementation((arg) => {
    if (arg === 'GITHUB_TOKEN') {
        return 'fake_token';
    }
});

// Mock functions that we can adjust between each test
const mockSetOutput = jest.fn();
const mockSetFailed = jest.fn();
const mockListForRepo = jest.fn();

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;
    core.setFailed = mockSetFailed;
    core.setOutput = mockSetOutput;

    const mocktokit = {
        issues: {
            listForRepo: mockListForRepo,
        },
    };
    github.getOctokit = jest.fn().mockImplementation(() => mocktokit);
});

beforeEach(() => {
    // Reset mocks before each test
    jest.resetModules();
});

afterEach(() => {
    mockSetOutput.mockClear();
    mockSetFailed.mockClear();
    mockListForRepo.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('checkForAutomergePullRequestsTest', () => {
    test('outputs true when there are open automerge pull requests', () => {
        mockListForRepo.mockResolvedValue({
            data: [
                {html_url: 'https://github.com/Expensify/Expensify.cash/pull/1'},
                {html_url: 'https://github.com/Expensify/Expensify.cash/pull/2'},
            ],
        });
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('OPEN_PR_FOUND', true);
        });
    });

    test('outputs false when there are no open automerge pull requests', () => {
        mockListForRepo.mockResolvedValue({data: []});
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('OPEN_PR_FOUND', false);
        });
    });

    test('catches API error', () => {
        mockListForRepo.mockRejectedValue({err: 'You done goofed, kid.'});
        return run().then(() => {
            expect(mockSetFailed).toHaveBeenCalledWith({err: 'You done goofed, kid.'});
        });
    });
});
