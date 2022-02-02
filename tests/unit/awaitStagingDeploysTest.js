/**
 * @jest-environment node
 */
const _ = require('underscore');
const run = require('../../.github/actions/awaitStagingDeploys/awaitStagingDeploys');
const GitHubUtils = require('../../.github/libs/GithubUtils');

// Lower poll rate to speed up tests
const TEST_POLL_RATE = 1;
const COMPLETED_WORKFLOW = {status: 'completed'};
const INCOMPLETE_WORKFLOW = {status: 'in_progress'};

const mockListPlatformDeploys = jest.fn();
const mockListPreDeploys = jest.fn();
const mockListWorkflowRuns = jest.fn().mockImplementation((args) => {
    const defaultReturn = Promise.resolve({data: {workflow_runs: []}});

    if (!_.has(args, 'workflow_id')) {
        return defaultReturn;
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
    // Mock octokit module
    const mocktokit = {
        actions: {
            listWorkflowRuns: mockListWorkflowRuns,
        },
    };
    GitHubUtils.octokitInternal = mocktokit;
    GitHubUtils.POLL_RATE = TEST_POLL_RATE;
});

describe('awaitStagingDeploys', () => {
    test('Should wait for all running staging deploys to finish', () => {
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

        const consoleSpy = jest.spyOn(console, 'log');
        return run()
            .then(() => {
                expect(consoleSpy).toHaveBeenCalledTimes(4);
                expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 2 staging deploys still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
            });
    });
});
