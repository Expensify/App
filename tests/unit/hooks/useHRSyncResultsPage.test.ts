import {renderHook} from '@testing-library/react-native';

import useHRSyncResultsPage from '@hooks/useHRSyncResultsPage';

import type HrSyncResult from '@libs/API/HrSyncResult';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {ConnectionName, PolicyConnectionSyncProgress, PolicyConnectionSyncStage} from '@src/types/onyx/Policy';

const RESULTS_ROUTE = 'workspaces/1A2B3C/hr-sync-results';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

// The real helper reads the active navigation state, which a hook test has no reason to build.
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: jest.fn(() => RESULTS_ROUTE),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        },
    },
}));

const mockNavigate = jest.mocked(Navigation.navigate);
const RESULT = {addedEmployeesCount: 2, removedEmployeesCount: 1, skippedEmployees: [{id: '7', name: 'Al Ex', reason: 'No email address.'}]};
const RUNNING = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE;
const JOB_DONE = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

/** Build one sync progress entry. Each backend update carries a fresh timestamp, therefore the caller supplies it. */
function syncProgress(
    stageInProgress: PolicyConnectionSyncStage,
    timestamp: string,
    result?: HrSyncResult,
    connectionName: ConnectionName = CONST.POLICY.CONNECTIONS.NAME.GUSTO,
): PolicyConnectionSyncProgress {
    return {
        connectionName,
        stageInProgress,
        timestamp,
        ...(result ? {result} : {}),
    };
}

function renderWith(initialProps: PolicyConnectionSyncProgress) {
    return renderHook((progress: PolicyConnectionSyncProgress) => useHRSyncResultsPage(progress, true), {initialProps});
}

describe('useHRSyncResultsPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('opens the results screen when the result arrives in a later update than the JOB_DONE stage', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000'));
        expect(mockNavigate).not.toHaveBeenCalled();

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(RESULTS_ROUTE);
    });

    it('opens the results screen when the result arrives with the JOB_DONE stage', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens the results screen one time when a result-less JOB_DONE update follows the result', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));

        // Onyx merges the later update, therefore the result stays on the entry.
        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens nothing for a sync that finished before the hook mounted', () => {
        const {rerender} = renderWith(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('opens the results screen for each sync the user runs', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));
        expect(mockNavigate).toHaveBeenCalledTimes(1);

        rerender(syncProgress(RUNNING, '2026-08-26 10:05:00.000', RESULT));
        rerender(syncProgress(JOB_DONE, '2026-08-26 10:05:05.000', RESULT));
        expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('opens nothing for a non-HR connection', () => {
        const xero = CONST.POLICY.CONNECTIONS.NAME.XERO;
        const {rerender} = renderWith(syncProgress(CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.XERO_SYNC_STEP, '2026-08-26 10:00:00.000', undefined, xero));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT, xero));
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
