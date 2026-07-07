import run from '@github/actions/javascript/awaitStagingDeploys/awaitStagingDeploys';
import CONST from '@github/libs/CONST';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

import type {Mock} from 'bun:test';

/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {afterAll, beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

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

type MockedFunctionListResponse = Mock<() => Promise<MockListResponse>>;

const consoleSpy = jest.spyOn(console, 'log');
const mockGetInput = jest.fn();
const mockListDeploysForTag: MockedFunctionListResponse = jest.fn();
const mockListDeploys: MockedFunctionListResponse = jest.fn();
const mockListPreDeploys: MockedFunctionListResponse = jest.fn();
const mockListWorkflowRuns = jest.fn().mockImplementation((args: Workflow) => {
    const defaultReturn = Promise.resolve({data: {workflow_runs: []}});

    if (!args.workflow_id) {
        return defaultReturn;
    }

    if (args.branch !== undefined) {
        return mockListDeploysForTag();
    }

    if (args.workflow_id === 'deploy.yml') {
        return mockListDeploys();
    }

    if (args.workflow_id === 'preDeploy.yml') {
        return mockListPreDeploys();
    }

    return defaultReturn;
});

// CONST's default export is a plain mutable object shared by reference with every other importer (unlike named
// exports on a module namespace, which are read-only live bindings), so it can be overridden in place rather than
// needing mock.module. Lower the poll rate to speed up the test.
const originalPollRate = CONST.POLL_RATE;
(CONST as {POLL_RATE: number}).POLL_RATE = TEST_POLL_RATE;

beforeAll(() => {
    // Mock core module. Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't be
    // reassigned directly (unlike Jest's Babel-transpiled CJS interop); spy on it instead.
    jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);

    // Mock octokit module
    const mockOctokit = {
        rest: {
            actions: {
                ...(GithubUtils.internalOctokit as unknown as typeof GithubUtils.octokit.actions),
                listWorkflowRuns: mockListWorkflowRuns as unknown as typeof GithubUtils.octokit.actions.listWorkflowRuns,
            },
        },
    };

    GithubUtils.internalOctokit = mockOctokit as InternalOctokit;
});

beforeEach(() => {
    consoleSpy.mockClear();
});

afterAll(() => {
    // `bun test` runs all files in one process sharing GithubUtils' module-level state, unlike Jest's per-file
    // module registry; reset it so later test files re-initialize their own octokit mock from scratch.
    GithubUtils.internalOctokit = undefined;
    // Likewise, undo the CONST.POLL_RATE override above so it doesn't leak into other test files.
    (CONST as {POLL_RATE: number}).POLL_RATE = originalPollRate;
});

describe('awaitStagingDeploys', () => {
    test('Should wait for all running staging deploys to finish', () => {
        mockGetInput.mockImplementation(() => undefined);

        // First ping
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
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
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
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
