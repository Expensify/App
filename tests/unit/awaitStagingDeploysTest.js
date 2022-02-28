/**
 * @jest-environment node
 */
const core = require('@actions/core');
const _ = require('underscore');
const run = require('../../.github/actions/awaitStagingDeploys/awaitStagingDeploys');
const GitHubUtils = require('../../.github/libs/GithubUtils');

// Lower poll rate to speed up tests
const TEST_POLL_RATE = 1;
const COMPLETED_WORKFLOW = {status: 'completed'};
const INCOMPLETE_WORKFLOW = {status: 'in_progress'};

const consoleSpy = jest.spyOn(console, 'log');
const mockGetInput = jest.fn();
const mockListPlatformDeploysForTag = jest.fn();
const mockListPlatformDeploys = jest.fn();
const mockListPreDeploys = jest.fn();
const mockListWorkflowRuns = jest.fn().mockImplementation((args) => {
    const defaultReturn = Promise.resolve({data: {workflow_runs: []}});

    if (!_.has(args, 'workflow_id')) {
        return defaultReturn;
    }

    if (!_.isUndefined(args.branch)) {
        return mockListPlatformDeploysForTag();
    }

    if (args.workflow_id === 'platformDeploy.yml') {
        return mockListPlatformDeploys();
    }

    if (args.workflow_id === 'preDeploy.yml') {
        return mockListPreDeploys();
    }

    return defaultReturn;
});

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;

    // Mock octokit module
    const mocktokit = {
        actions: {
            listWorkflowRuns: mockListWorkflowRuns,
        },
    };
    GitHubUtils.octokitInternal = mocktokit;
    GitHubUtils.POLL_RATE = TEST_POLL_RATE;
});

beforeEach(() => {
    consoleSpy.mockClear();
});

describe('awaitStagingDeploys', () => {
    test('Should wait for all running staging deploys to finish', () => {
        mockGetInput.mockImplementation(() => undefined);

        // First ping
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [],
            },
        });

        // Second ping
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [],
            },
        });

        // Third ping
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });

        // Fourth ping
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                ],
            },
        });

        return run()
            .then(() => {
                expect(consoleSpy).toHaveBeenCalledTimes(4);
                expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 2 staging deploys still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
            });
    });

    test('Should only wait for a specific staging deploy to finish', () => {
        mockGetInput.mockImplementation(() => 'my-tag');

        // First ping
        mockListPlatformDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });

        // Second ping
        mockListPlatformDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                    COMPLETED_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                ],
            },
        });

        // Third ping
        mockListPlatformDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                ],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    INCOMPLETE_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });

        return run()
            .then(() => {
                expect(consoleSpy).toHaveBeenCalledTimes(3);
                expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
            });
    });
});
