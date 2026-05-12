/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '@github/actions/javascript/waitForPreviousRuns/waitForPreviousRuns';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import asMutable from '@src/types/utils/asMutable';

const CURRENT_RUN_ID = 1000;
const WORKFLOW_ID = 'testBuildOnPush.yml';
const TEST_POLL_RATE_S = '0.001';
const TEST_QUEUE_LIMIT = '20';

type WorkflowRun = {id: number; status: string};

const mockGetInput = jest.fn();
const mockListWorkflowRuns = jest.fn();

/** Mock a single poll response with the given runs. */
function mockPoll(runs: WorkflowRun[]) {
    mockListWorkflowRuns.mockResolvedValueOnce({data: {workflow_runs: runs}});
}

/** Mock a single poll that rejects with an error. */
function mockPollError(message = 'API error') {
    mockListWorkflowRuns.mockRejectedValueOnce(new Error(message));
}

const coreInfoSpy = jest.spyOn(core, 'info');
const coreNoticeSpy = jest.spyOn(core, 'notice');
const coreWarningSpy = jest.spyOn(core, 'warning');
const coreErrorSpy = jest.spyOn(core, 'error');

function getInfoMessages(): string[] {
    return coreInfoSpy.mock.calls.map((call) => String(call[0]));
}

function getWarningMessages(): string[] {
    return coreWarningSpy.mock.calls.map((call) => String(call[0]));
}

function getNoticeMessages(): string[] {
    return coreNoticeSpy.mock.calls.map((call) => String(call[0]));
}

function getErrorMessages(): string[] {
    return coreErrorSpy.mock.calls.map((call) => String(call[0]));
}

jest.mock('@github/libs/CONST', () => ({
    __esModule: true,
    default: {
        GITHUB_OWNER: 'Expensify',
        APP_REPO: 'App',
    },
}));

beforeAll(() => {
    asMutable(core).getInput = mockGetInput;

    mockGetInput.mockImplementation((name: string) => {
        if (name === 'WORKFLOW_ID') {
            return WORKFLOW_ID;
        }
        if (name === 'CURRENT_RUN_ID') {
            return String(CURRENT_RUN_ID);
        }
        if (name === 'POLL_RATE_SECONDS') {
            return TEST_POLL_RATE_S;
        }
        if (name === 'QUEUE_LIMIT') {
            return TEST_QUEUE_LIMIT;
        }
        return '';
    });

    GithubUtils.internalOctokit = {
        rest: {
            actions: {
                ...(GithubUtils.internalOctokit as unknown as typeof GithubUtils.octokit.actions),
                listWorkflowRuns: mockListWorkflowRuns as unknown as typeof GithubUtils.octokit.actions.listWorkflowRuns,
            },
        },
    } as InternalOctokit;
});

beforeEach(() => {
    coreInfoSpy.mockClear();
    coreNoticeSpy.mockClear();
    coreWarningSpy.mockClear();
    coreErrorSpy.mockClear();
    mockListWorkflowRuns.mockClear();
});

describe('waitForPreviousRuns', () => {
    test('Should proceed immediately when no earlier runs exist', () => {
        mockPoll([{id: 1000, status: 'in_progress'}]);

        return run().then(() => {
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
            expect(getNoticeMessages().some((msg) => msg.includes('maxRunsAhead=0') && msg.includes('iterations=1'))).toBe(true);
        });
    });

    test('Should proceed when only newer runs exist', () => {
        mockPoll([
            {id: 2000, status: 'in_progress'},
            {id: 3000, status: 'queued'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should wait for older in-progress runs to finish', () => {
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getInfoMessages().some((msg) => msg.includes('Waiting for 1 earlier run(s):'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should wait for older queued runs to finish', () => {
        mockPoll([
            {id: 800, status: 'queued'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 800, status: 'completed'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getInfoMessages().some((msg) => msg.includes('Waiting for 1 earlier run(s):'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should wait across multiple polls until older run finishes', () => {
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getInfoMessages().filter((msg) => msg.includes('Waiting for 1 earlier run(s):')).length).toBe(2);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
            expect(getNoticeMessages().some((msg) => msg.includes('maxRunsAhead=1') && msg.includes('iterations=3'))).toBe(true);
        });
    });

    test('Should ignore newer runs and only wait for older ones', () => {
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 2000, status: 'queued'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 2000, status: 'queued'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getInfoMessages().some((msg) => msg.includes('Waiting for 1 earlier run(s):'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should retry on API error and proceed after recovery', () => {
        mockPollError();
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getWarningMessages().some((msg) => msg.includes('API error (attempt 1/2)'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should retry twice on API errors and proceed after recovery', () => {
        mockPollError();
        mockPollError();
        mockPoll([{id: 1000, status: 'in_progress'}]);

        return run().then(() => {
            expect(getWarningMessages().some((msg) => msg.includes('API error (attempt 1/2)'))).toBe(true);
            expect(getWarningMessages().some((msg) => msg.includes('API error (attempt 2/2)'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should fail after 3 consecutive API errors', () => {
        mockPollError();
        mockPollError();
        mockPollError('Final failure');

        return run().catch((error: Error) => {
            expect(error.message).toBe('Final failure');
            expect(getErrorMessages().some((msg) => msg.includes('API failed 3 times in a row'))).toBe(true);
        });
    });

    test('Should reset error count after a successful poll', () => {
        mockPollError();
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 1000, status: 'in_progress'},
        ]);
        mockPollError();
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getWarningMessages().filter((msg) => msg.includes('API error (attempt 1/2)')).length).toBe(2);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
        });
    });

    test('Should wait through a 4-run queue in FIFO order', () => {
        // #500 in_progress, #800 queued, #1200 queued (newer, ignored)
        mockPoll([
            {id: 500, status: 'in_progress'},
            {id: 800, status: 'queued'},
            {id: 1200, status: 'queued'},
            {id: 1000, status: 'queued'},
        ]);
        // #500 done, #800 now in progress
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 800, status: 'in_progress'},
            {id: 1200, status: 'queued'},
            {id: 1000, status: 'queued'},
        ]);
        // #800 done
        mockPoll([
            {id: 500, status: 'completed'},
            {id: 800, status: 'completed'},
            {id: 1200, status: 'queued'},
            {id: 1000, status: 'in_progress'},
        ]);

        return run().then(() => {
            expect(getInfoMessages().some((msg) => msg.includes('Waiting for 2 earlier run(s):'))).toBe(true);
            expect(getInfoMessages().some((msg) => msg.includes('Waiting for 1 earlier run(s):'))).toBe(true);
            expect(coreInfoSpy).toHaveBeenCalledWith('No earlier runs in progress. Proceeding with build.');
            expect(getInfoMessages().some((msg) => msg.startsWith('Waiting') && msg.includes('1200'))).toBe(false);
            expect(getNoticeMessages().some((msg) => msg.includes('maxRunsAhead=2') && msg.includes('iterations=3'))).toBe(true);
        });
    });
});
