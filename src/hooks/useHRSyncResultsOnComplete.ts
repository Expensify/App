import {useEffect, useEffectEvent, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {HRSyncResults} from '@components/Dialog';
import {useIsAnyModalActive} from '@components/Overlay/hooks/useOverlaySelectors';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import CONST from '@src/CONST';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import usePrevious from './usePrevious';

function useHRSyncResultsOnComplete(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const previousSyncProgress = usePrevious(connectionSyncProgress);
    const pendingSyncResultRef = useRef<Pick<PolicyConnectionSyncProgress, 'connectionName' | 'result'> | null>(null);
    const isAnyModalActive = useIsAnyModalActive();

    const connectionName = connectionSyncProgress?.connectionName;
    const showSyncResultsModal = useEffectEvent((syncResult: PolicyConnectionSyncProgress['result'], syncConnectionName: PolicyConnectionSyncProgress['connectionName']) => {
        if (!syncResult || !syncConnectionName) {
            return;
        }

        HRSyncResults.call({result: syncResult, policyID});
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

export default useHRSyncResultsOnComplete;
