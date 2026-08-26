import {renderHook} from '@testing-library/react-native';

import useHRSyncResultsModal from '@hooks/useHRSyncResultsModal';

import CONST from '@src/CONST';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

const mockShowModal = jest.fn();

jest.mock('@components/HRSyncResultsModal', () => 'HRSyncResultsModal');

jest.mock('@components/Modal/Global/ModalContext', () => ({
    useModal: () => ({showModal: mockShowModal}),
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

const POLICY_ID = '1A2B3C';
const RESULT = {addedEmployeesCount: 2, removedEmployeesCount: 1, skippedEmployees: [{id: '7', name: 'Al Ex', reason: 'No email address.'}]};
const RUNNING = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE;
const JOB_DONE = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

/** Build one sync progress entry. Each backend update carries a fresh timestamp, therefore the caller supplies it. */
function syncProgress(stageInProgress: string, timestamp: string, result?: PolicyConnectionSyncProgress['result']): PolicyConnectionSyncProgress {
    return {
        connectionName: CONST.POLICY.CONNECTIONS.NAME.GUSTO,
        stageInProgress,
        timestamp,
        ...(result ? {result} : {}),
    } as PolicyConnectionSyncProgress;
}

function renderWith(initialProps: PolicyConnectionSyncProgress) {
    return renderHook((progress: PolicyConnectionSyncProgress) => useHRSyncResultsModal(POLICY_ID, progress, true), {initialProps});
}

describe('useHRSyncResultsModal', () => {
    beforeEach(() => {
        mockShowModal.mockClear();
    });

    it('shows the modal when the result arrives in a later update than the JOB_DONE stage', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000'));
        expect(mockShowModal).not.toHaveBeenCalled();

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockShowModal).toHaveBeenCalledTimes(1);
        expect(mockShowModal).toHaveBeenCalledWith(expect.objectContaining({props: {result: RESULT, policyID: POLICY_ID}}));
    });

    it('shows the modal when the result arrives with the JOB_DONE stage', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));
        expect(mockShowModal).toHaveBeenCalledTimes(1);
    });

    it('shows the modal one time when a result-less JOB_DONE update follows the result', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));

        // Onyx merges the later update, therefore the result stays on the entry.
        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockShowModal).toHaveBeenCalledTimes(1);
    });

    it('shows no modal for a sync that finished before the hook mounted', () => {
        const {rerender} = renderWith(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT));
        expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('shows a modal for each sync the user runs', () => {
        const {rerender} = renderWith(syncProgress(RUNNING, '2026-08-26 10:00:00.000'));

        rerender(syncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT));
        expect(mockShowModal).toHaveBeenCalledTimes(1);

        rerender(syncProgress(RUNNING, '2026-08-26 10:05:00.000', RESULT));
        rerender(syncProgress(JOB_DONE, '2026-08-26 10:05:05.000', RESULT));
        expect(mockShowModal).toHaveBeenCalledTimes(2);
    });

    it('shows no modal for a non-HR connection', () => {
        const {rerender} = renderWith({
            connectionName: CONST.POLICY.CONNECTIONS.NAME.XERO,
            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.XERO_SYNC_STEP,
            timestamp: '2026-08-26 10:00:00.000',
        } as PolicyConnectionSyncProgress);

        rerender({
            connectionName: CONST.POLICY.CONNECTIONS.NAME.XERO,
            stageInProgress: JOB_DONE,
            timestamp: '2026-08-26 10:00:05.000',
            result: RESULT,
        } as PolicyConnectionSyncProgress);
        expect(mockShowModal).not.toHaveBeenCalled();
    });
});
