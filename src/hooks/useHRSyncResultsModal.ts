import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import HRSyncResultsModal from '@components/HRSyncResultsModal';
import {useModal} from '@components/Modal/Global/ModalContext';
import CONST from '@src/CONST';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import usePrevious from './usePrevious';

/**
 * Watches an HR provider's sync progress and automatically opens the `HRSyncResultsModal`
 * when the sync transitions to the `JOB_DONE` stage with a result payload.
 */
function useHRSyncResultsModal(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const modal = useModal();
    const previousSyncProgress = usePrevious(connectionSyncProgress);

    const connectionName = connectionSyncProgress?.connectionName;

    useEffect(() => {
        const syncResult = connectionSyncProgress?.result;
        const isHRSyncDoneWithResult =
            CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES.includes(connectionName as TupleToUnion<typeof CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES>) &&
            connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
            !!syncResult;
        const didTransitionToJobDone = previousSyncProgress?.connectionName === connectionName && previousSyncProgress?.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
        const didHRSyncComplete = isFocused && isHRSyncDoneWithResult && didTransitionToJobDone;

        if (!didHRSyncComplete || !syncResult || !connectionName) {
            return;
        }

        modal.showModal({
            component: HRSyncResultsModal,
            props: {result: syncResult, policyID},
            id: `${connectionName}-sync-results-${policyID}`,
        });
    }, [
        connectionName,
        connectionSyncProgress?.result,
        connectionSyncProgress?.stageInProgress,
        connectionSyncProgress?.timestamp,
        isFocused,
        policyID,
        previousSyncProgress?.connectionName,
        previousSyncProgress?.stageInProgress,
        modal,
    ]);
}

export default useHRSyncResultsModal;
