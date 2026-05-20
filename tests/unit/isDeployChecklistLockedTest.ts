/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '../../.github/actions/javascript/isDeployChecklistLocked/isDeployChecklistLocked';
import CONST from '../../.github/libs/CONST';
import * as DeployChecklistUtils from '../../.github/libs/DeployChecklistUtils';

jest.mock('../../.github/libs/DeployChecklistUtils', () => {
    const actual = jest.requireActual('../../.github/libs/DeployChecklistUtils') as unknown as typeof DeployChecklistUtils;
    return {
        ...actual,
        getDeployChecklist: jest.fn(),
    };
});

const mockGetDeployChecklist = DeployChecklistUtils.getDeployChecklist as jest.MockedFunction<typeof DeployChecklistUtils.getDeployChecklist>;

beforeAll(() => {
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
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
                expect(setFailedMock.mock.calls.at(0)?.at(0)).toEqual(expect.stringContaining('Could not resolve deploy checklist'));
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
