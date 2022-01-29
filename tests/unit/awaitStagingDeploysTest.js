/**
 * @jest-environment node
 */
const run = require('../../.github/actions/awaitStagingDeploys/awaitStagingDeploys');
const GitHubUtils = require('../../.github/libs/GithubUtils');

// Lower poll rate to speed up tests
const TEST_POLL_RATE = 1;
const COMPLETED_WORKFLOW = {status: 'completed'};
const INCOMPLETE_WORKFLOW = {status: 'in_progress'};

const mockListWorkflowRuns = jest.fn();

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
        mockListWorkflowRuns.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListWorkflowRuns.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    INCOMPLETE_WORKFLOW,
                ],
            },
        });
        mockListWorkflowRuns.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                    COMPLETED_WORKFLOW,
                ],
            },
        });

        const consoleSpy = jest.spyOn(console, 'log');
        return run()
            .then(() => {
                expect(consoleSpy).toHaveBeenCalledTimes(3);
                expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 2 staging deploys still running...');
                expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
                expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
            });
    });
});
