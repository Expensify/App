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
        listOpenStagingDeployChecklistIssuesWithRetry: jest.fn(),
    };
});

const mockListOpenStagingDeployChecklistIssuesWithRetry = DeployChecklistUtils.listOpenStagingDeployChecklistIssuesWithRetry as jest.MockedFunction<
    typeof DeployChecklistUtils.listOpenStagingDeployChecklistIssuesWithRetry
>;

beforeAll(() => {
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
});

describe('isDeployChecklistLockedTest', () => {
    describe('GitHub action run function', () => {
        test('No open checklist after successful list → not locked', () => {
            mockListOpenStagingDeployChecklistIssuesWithRetry.mockResolvedValue([]);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 0);
                expect(setOutputMock).toHaveBeenCalledWith('CHECKLIST_STATE', 'absent');
            });
        });

        test('Multiple open checklists → locked (fail closed)', () => {
            mockListOpenStagingDeployChecklistIssuesWithRetry.mockResolvedValue([
                {number: 1, labels: []},
                {number: 2, labels: []},
            ] as Awaited<ReturnType<typeof DeployChecklistUtils.listOpenStagingDeployChecklistIssuesWithRetry>>);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 0);
                expect(setOutputMock).toHaveBeenCalledWith('CHECKLIST_STATE', 'ambiguous');
            });
        });

        test('Single issue with lock label → locked', () => {
            mockListOpenStagingDeployChecklistIssuesWithRetry.mockResolvedValue([
                {
                    number: 42,
                    labels: [{name: CONST.LABELS.LOCK_DEPLOY}],
                },
            ] as Awaited<ReturnType<typeof DeployChecklistUtils.listOpenStagingDeployChecklistIssuesWithRetry>>);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 42);
                expect(setOutputMock).toHaveBeenCalledWith('CHECKLIST_STATE', 'locked');
            });
        });

        test('Single issue without lock label → unlocked', () => {
            mockListOpenStagingDeployChecklistIssuesWithRetry.mockResolvedValue([
                {
                    number: 99,
                    labels: [{name: CONST.LABELS.STAGING_DEPLOY}],
                },
            ] as Awaited<ReturnType<typeof DeployChecklistUtils.listOpenStagingDeployChecklistIssuesWithRetry>>);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 99);
                expect(setOutputMock).toHaveBeenCalledWith('CHECKLIST_STATE', 'unlocked');
            });
        });

        test('List throws after retries path → locked (unknown)', () => {
            mockListOpenStagingDeployChecklistIssuesWithRetry.mockRejectedValue(new Error('GitHub unavailable'));
            const setOutputMock = jest.spyOn(core, 'setOutput');
            return run().then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
                expect(setOutputMock).toHaveBeenCalledWith('NUMBER', 0);
                expect(setOutputMock).toHaveBeenCalledWith('CHECKLIST_STATE', 'unknown');
            });
        });
    });
});
