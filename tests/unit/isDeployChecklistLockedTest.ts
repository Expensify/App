import * as core from '@actions/core';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, mock, test} from 'bun:test';

import CONST from '../../.github/libs/CONST';
import * as DeployChecklistUtils from '../../.github/libs/DeployChecklistUtils';

const mockGetDeployChecklist = jest.fn<typeof DeployChecklistUtils.getDeployChecklist>();

// Capture the real exports by value before mocking: `DeployChecklistUtils` is a live namespace binding tied to
// the shared module registry entry, so once mock.module() below replaces that entry, `DeployChecklistUtils` would
// itself resolve to the mocked exports too - which would make the afterAll restoration below a no-op that
// "restores" the mock forever instead of the real module.
const originalDeployChecklistUtils = {...DeployChecklistUtils};

// Must run before `isDeployChecklistLocked` (which imports DeployChecklistUtils internally) is imported below:
// mock.module patches the shared module registry entry, and existing named-import bindings to it are live, but
// only if the patch happens before those bindings are first read.
await mock.module('../../.github/libs/DeployChecklistUtils', () => ({
    ...DeployChecklistUtils,
    getDeployChecklist: mockGetDeployChecklist,
}));

// Must be imported after the mock.module() call above so it picks up the mock.
const {default: run} = await import('../../.github/actions/javascript/isDeployChecklistLocked/isDeployChecklistLocked');

beforeAll(() => {
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(async () => {
    delete process.env.INPUT_GITHUB_TOKEN;
    // `bun test` runs all files in one process sharing the module registry, unlike Jest's per-file registry, so
    // mock.module's patch would otherwise leak into every other test file that imports this module afterwards.
    await mock.module('../../.github/libs/DeployChecklistUtils', () => originalDeployChecklistUtils);
});

describe('isDeployChecklistLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Single issue with lock label → locked', () => {
            mockGetDeployChecklist.mockResolvedValue({
                number: 42,
                labels: [{name: CONST.LABELS.LOCK_DEPLOY}],
            } as unknown as Awaited<ReturnType<typeof DeployChecklistUtils.getDeployChecklist>>);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 42);
                expect(setFailedMock).not.toHaveBeenCalled();
            });
        });

        test('Single issue without lock label → unlocked', () => {
            mockGetDeployChecklist.mockResolvedValue({
                number: 99,
                labels: [{name: CONST.LABELS.STAGING_DEPLOY}],
            } as unknown as Awaited<ReturnType<typeof DeployChecklistUtils.getDeployChecklist>>);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 99);
                expect(setFailedMock).not.toHaveBeenCalled();
            });
        });

        test('NoOpenDeployChecklistError → not locked, no fail', () => {
            mockGetDeployChecklist.mockRejectedValue(new DeployChecklistUtils.NoOpenDeployChecklistError('No open StagingDeployCash issue (most recent #100 is closed).'));
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 0);
                expect(setFailedMock).not.toHaveBeenCalled();
            });
        });

        test('Generic error → core.setFailed, no IS_LOCKED set', () => {
            mockGetDeployChecklist.mockRejectedValue(new Error('GitHub unavailable'));
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
            return run().then(() => {
                expect(setFailedMock).toHaveBeenCalledTimes(1);
                expect(setFailedMock.mock.calls.at(0)?.at(0)).toContain('Could not resolve deploy checklist');
                expect(setOutputMock).not.toHaveBeenCalledWith('IS_LOCKED', expect.anything());
                expect(setOutputMock).not.toHaveBeenCalledWith('NUMBER', expect.anything());
            });
        });

        test('Inconsistent GitHub response (non-NoOpen error) → core.setFailed', () => {
            mockGetDeployChecklist.mockRejectedValue(
                new Error('Inconsistent GitHub response: state:open returned empty but the most recent StagingDeployCash issue #500 is open. Refusing to deploy.'),
            );
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
            return run().then(() => {
                expect(setFailedMock).toHaveBeenCalledTimes(1);
                expect(setOutputMock).not.toHaveBeenCalledWith('IS_LOCKED', expect.anything());
            });
        });
    });
});
