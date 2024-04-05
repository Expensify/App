/* eslint-disable @typescript-eslint/naming-convention */

/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '@github/actions/javascript/awaitStagingDeploys/awaitStagingDeploys';
import type CONST from '@github/libs/CONST';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import asMutable from '@src/types/utils/asMutable';

type Workflow = {
    workflow_id: string;
    branch: string;
    owner: string;
};

type WorkflowStatus = {status: string};

// Lower poll rate to speed up tests
const TEST_POLL_RATE = 1;
const COMPLETED_WORKFLOW: WorkflowStatus = {status: 'completed'};
const INCOMPLETE_WORKFLOW: WorkflowStatus = {status: 'in_progress'};

type MockListResponse = {
    data: {
        workflow_runs: WorkflowStatus[];
    };
};

type MockedFunctionListResponse = jest.MockedFunction<() => Promise<MockListResponse>>;

const consoleSpy = jest.spyOn(console, 'log');
const mockGetInput = jest.fn();
const mockListPlatformDeploysForTag: MockedFunctionListResponse = jest.fn();
const mockListPlatformDeploys: MockedFunctionListResponse = jest.fn();
const mockListPreDeploys: MockedFunctionListResponse = jest.fn();
const mockListWorkflowRuns = jest.fn().mockImplementation((args: Workflow) => {
    const defaultReturn = Promise.resolve({data: {workflow_runs: []}});

    if (!args.workflow_id) {
        return defaultReturn;
    }

    if (args.branch !== undefined) {
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

jest.mock('@github/libs/CONST', () => ({
    ...jest.requireActual<typeof CONST>('@github/libs/CONST'),
    POLL_RATE: TEST_POLL_RATE,
}));

beforeAll(() => {
    // Mock core module
    asMutable(core).getInput = mockGetInput;

    // Mock octokit module
    const moctokit: InternalOctokit = {
        rest: {
            // @ts-expect-error This error was removed because getting the rest of the data from internalOctokit makes the test to break
            actions: {
                listWorkflowRuns: mockListWorkflowRuns as unknown as typeof GithubUtils.octokit.actions.listWorkflowRuns,
            },
        },
    };

    GithubUtils.internalOctokit = moctokit;
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
                workflow_runs: [COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
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
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
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
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });

        // Fourth ping
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW],
            },
        });

        return run().then(() => {
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
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });

        // Second ping
        mockListPlatformDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });

        // Third ping
        mockListPlatformDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW],
            },
        });
        mockListPlatformDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });

        return run().then(() => {
            expect(consoleSpy).toHaveBeenCalledTimes(3);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
        });
    });
});
