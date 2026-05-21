import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import GustoSyncResultsModal from '@components/GustoSyncResultsModal';
import {useModal} from '@components/Modal/Global/ModalContext';
import CONST from '@src/CONST';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import usePrevious from './usePrevious';

function useGustoSyncResultsModal(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const modal = useModal();
    const previousSyncProgress = usePrevious(connectionSyncProgress);

    useEffect(() => {
        const syncResult = connectionSyncProgress?.result;
        const isGustoSyncDoneWithResult =
            connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO &&
            connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
            !!syncResult;
        const didTransitionToJobDone =
            previousSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO && previousSyncProgress?.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
        const didGustoSyncComplete = isFocused && isGustoSyncDoneWithResult && didTransitionToJobDone;

        if (!didGustoSyncComplete || !syncResult) {
            return;
        }

        modal.showModal({
            component: GustoSyncResultsModal,
            props: {result: syncResult},
            id: `gusto-sync-results-${policyID}`,
        });
    }, [
        connectionSyncProgress?.connectionName,
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

export default useGustoSyncResultsModal;
