
const core = require('@actions/core');
const github = require('@actions/github');
const run = require('../../.github/actions/isPullRequestMergeable/isPullRequestMergeable');

// Static mock function for core.getInput
const mockGetInput = jest.fn().mockImplementation((arg) => {
    if (arg === 'GITHUB_TOKEN') {
        return 'fake_token';
    }

    if (arg === 'PULL_REQUEST_NUMBER') {
        return 42;
    }
});

// Mock functions that we can adjust between each test
const mockSetOutput = jest.fn();
const mockSetFailed = jest.fn();
const mockGetPullRequest = jest.fn();

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;
    core.setFailed = mockSetFailed;
    core.setOutput = mockSetOutput;

    // Mock octokit module
    const mocktokit = {
        pulls: {
            get: mockGetPullRequest,
        },
    };
    github.getOctokit = jest.fn().mockImplementation(() => mocktokit);
});

afterEach(() => {
    mockSetOutput.mockClear();
    mockSetFailed.mockClear();
    mockGetPullRequest.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('isPullRequestMergeable', () => {
    test('Pull request immediately mergeable', () => {
        mockGetPullRequest.mockResolvedValue({data: {mergeable: true}});
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', true);
        });
    });

    test('Pull request immediately not mergeable', () => {
        mockGetPullRequest.mockResolvedValue({data: {mergeable: false}});
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', false);
        });
    });

    test('Pull request mergeable after delay', () => {
        mockGetPullRequest
            .mockResolvedValue({data: {mergeable: true}})
            .mockResolvedValueOnce({data: {mergeable: null}})
            .mockResolvedValueOnce({data: {mergeable: null}});
        return run().then(() => {
            expect(mockGetPullRequest).toHaveBeenCalledTimes(3);
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', true);
        });
    });

    test('Pull request not mergeable after delay', () => {
        mockGetPullRequest
            .mockResolvedValue({data: {mergeable: false}})
            .mockResolvedValueOnce({data: {mergeable: null}})
            .mockResolvedValueOnce({data: {mergeable: null}});
        return run().then(() => {
            expect(mockGetPullRequest).toHaveBeenCalledTimes(3);
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', false);
        });
    });

    test('Github API error', () => {
        mockGetPullRequest.mockRejectedValue(new Error('Some github error'));
        return run().then(() => {
            expect(mockSetFailed).toHaveBeenCalledWith(new Error('Some github error'));
        });
    });
});
