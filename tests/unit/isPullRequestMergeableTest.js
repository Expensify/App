const core = require('@actions/core');
const GithubUtils = require('../../.github/libs/GithubUtils');
const run = require('../../.github/actions/javascript/isPullRequestMergeable/isPullRequestMergeable');

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
const mockListChecks = jest.fn();
const mockError = new Error('Some GitHub error');

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;
    core.setFailed = mockSetFailed;
    core.setOutput = mockSetOutput;

    // Mock octokit module
    const moctokit = {
        rest: {
            pulls: {
                get: mockGetPullRequest,
            },
            checks: {
                listForRef: mockListChecks,
            },
        },
    };
    GithubUtils.internalOctokit = moctokit;
});

afterEach(() => {
    mockSetOutput.mockClear();
    mockSetFailed.mockClear();
    mockGetPullRequest.mockClear();
    mockListChecks.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('isPullRequestMergeable', () => {
    test('Pull request immediately mergeable', () => {
        mockGetPullRequest.mockResolvedValue({data: {mergeable: true, mergeable_state: 'clean', head: {sha: 'abcd'}}});
        mockListChecks.mockResolvedValue({data: {check_runs: [{status: 'completed'}, {status: 'completed'}]}});
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', true);
        });
    });

    test('Pull request immediately not mergeable', () => {
        mockGetPullRequest.mockResolvedValue({data: {mergeable: false, mergeable_state: 'blocked', head: {sha: 'abcd'}}});
        mockListChecks.mockResolvedValue({data: {check_runs: [{status: 'completed'}, {status: 'completed'}]}});
        return run().then(() => {
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', false);
        });
    });

    test('Pull request mergeable after delay', () => {
        mockGetPullRequest
            .mockResolvedValue({data: {mergeable: true, mergeable_state: 'clean', head: {sha: 'abcd'}}})
            .mockResolvedValueOnce({data: {mergeable: null, mergeable_state: 'blocked', head: {sha: 'abcd'}}}) // first response
            .mockResolvedValueOnce({data: {mergeable: null, mergeable_state: 'blocked', head: {sha: 'abcd'}}}) // second response
            .mockResolvedValueOnce({data: {mergeable: true, mergeable_state: 'blocked', head: {sha: 'abcd'}}}); // third response
        mockListChecks
            .mockResolvedValue({data: {check_runs: [{status: 'completed'}, {status: 'completed'}]}})
            .mockResolvedValueOnce({data: {check_runs: [{status: 'in_progress'}, {status: 'in_progress'}]}}) // first response
            .mockResolvedValueOnce({data: {check_runs: [{status: 'completed'}, {status: 'in_progress'}]}}); // second response
        return run().then(() => {
            expect(mockGetPullRequest).toHaveBeenCalledTimes(4);
            expect(mockListChecks).toHaveBeenCalledTimes(3);
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', true);
        });
    });

    test('Pull request not mergeable after delay', () => {
        mockGetPullRequest
            .mockResolvedValue({data: {mergeable: false, mergeable_state: 'blocked', head: {sha: 'abcd'}}})
            .mockResolvedValueOnce({data: {mergeable: null, head: {sha: 'abcd'}}})
            .mockResolvedValueOnce({data: {mergeable: null, head: {sha: 'abcd'}}});
        mockListChecks.mockResolvedValue({data: {check_runs: [{status: 'completed'}]}});
        return run().then(() => {
            expect(mockGetPullRequest).toHaveBeenCalledTimes(3);
            expect(mockListChecks).toHaveBeenCalledTimes(2);
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', false);
        });
    });

    test('Pull request mergeability never resolves', () => {
        mockGetPullRequest
            .mockResolvedValue({data: {mergeable: null, head: {sha: 'abcd'}}});
        mockListChecks.mockResolvedValue({data: {check_runs: [{status: 'completed'}]}});
        return run().then(() => {
            expect(mockGetPullRequest).toHaveBeenCalledTimes(31);
            expect(mockListChecks).toHaveBeenCalledTimes(30);
            expect(mockSetOutput).toHaveBeenCalledWith('IS_MERGEABLE', false);
        });
    });

    test('Github API error on first request', () => {
        mockGetPullRequest.mockRejectedValue(mockError);
        return run().then(() => {
            expect(mockSetFailed).toHaveBeenCalledWith(mockError);
        });
    });

    test('GitHub API error on later request', () => {
        mockGetPullRequest.mockResolvedValue({data: {mergeable: null, head: {sha: 'abcd'}}});
        mockListChecks.mockRejectedValue(mockError);
        return run().then(() => {
            expect(mockSetFailed).toHaveBeenCalledWith(mockError);
        });
    });
});
