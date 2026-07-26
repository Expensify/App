import HRSyncResultsModal from '@components/HRSyncResultsModal';
import {useModal} from '@components/Modal/Global/ModalContext';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import {isModalActiveSelector} from '@selectors/Modal';
import {useEffect, useEffectEvent, useRef} from 'react';

import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

/**
 * Watches an HR provider's sync progress and automatically opens the `HRSyncResultsModal`
 * when the sync transitions to the `JOB_DONE` stage with a result payload.
 */
function useHRSyncResultsModal(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const modal = useModal();
    const previousSyncProgress = usePrevious(connectionSyncProgress);
    const pendingSyncResultRef = useRef<Pick<PolicyConnectionSyncProgress, 'connectionName' | 'result'> | null>(null);
    const [isAnyModalActive] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});

    const connectionName = connectionSyncProgress?.connectionName;
    const showSyncResultsModal = useEffectEvent((syncResult: PolicyConnectionSyncProgress['result'], syncConnectionName: PolicyConnectionSyncProgress['connectionName']) => {
        if (!syncResult || !syncConnectionName) {
            return;
        }

        modal.showModal({
            component: HRSyncResultsModal,
            props: {result: syncResult, policyID},
            id: `${syncConnectionName}-sync-results-${policyID}`,
        });
    });

    useEffect(() => {
        const syncResult = connectionSyncProgress?.result;
        const isHRConnectionName = CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES.some((hrConnectionName) => hrConnectionName === connectionName);
        const isHRSyncDoneWithResult = isHRConnectionName && connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE && !!syncResult;
        const didTransitionToJobDone = previousSyncProgress?.connectionName === connectionName && previousSyncProgress?.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
        const didHRSyncComplete = isFocused && isHRSyncDoneWithResult && didTransitionToJobDone;

        if (didHRSyncComplete && syncResult && connectionName) {
            pendingSyncResultRef.current = {connectionName, result: syncResult};
        }

        const pendingSyncResult = pendingSyncResultRef.current;
        if (!pendingSyncResult || isAnyModalActive) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                showSyncResultsModal(pendingSyncResult.result, pendingSyncResult.connectionName);
                pendingSyncResultRef.current = null;
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [
        connectionName,
        connectionSyncProgress?.result,
        connectionSyncProgress?.stageInProgress,
        connectionSyncProgress?.timestamp,
        isAnyModalActive,
        isFocused,
        previousSyncProgress?.connectionName,
        previousSyncProgress?.stageInProgress,
    ]);
}

export default useHRSyncResultsModal;
