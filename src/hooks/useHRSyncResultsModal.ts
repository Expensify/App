import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import HRSyncResultsModal from '@components/HRSyncResultsModal';
import {useModal} from '@components/Modal/Global/ModalContext';
import {getConnectedHRProvider} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyConnectionsSelector} from '@src/selectors/Policy';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

function useHRSyncResultsModal(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const modal = useModal();
    const previousSyncProgress = usePrevious(connectionSyncProgress);
    const [policyConnections] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyConnectionsSelector});

    const connectionName = connectionSyncProgress?.connectionName;
    const providerDisplayName =
        getConnectedHRProvider({connections: policyConnections})?.displayName ??
        CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName as keyof typeof CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY] ??
        connectionName;

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
            props: {result: syncResult, providerDisplayName},
            id: `${connectionName}-sync-results-${policyID}`,
        });
    }, [
        connectionName,
        connectionSyncProgress?.result,
        connectionSyncProgress?.stageInProgress,
        connectionSyncProgress?.timestamp,
        isFocused,
        providerDisplayName,
        policyID,
        previousSyncProgress?.connectionName,
        previousSyncProgress?.stageInProgress,
        modal,
    ]);
}

export default useHRSyncResultsModal;
