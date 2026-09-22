import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import {isModalActiveSelector} from '@selectors/Modal';
import {useEffect, useEffectEvent, useRef} from 'react';

import useOnyx from './useOnyx';

/**
 * Watches an HR provider's sync progress and automatically opens the HR sync results screen
 * when the sync reaches the `JOB_DONE` stage with a result payload.
 */
function useHRSyncResultsPage(connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const pendingSyncResultRef = useRef<Pick<PolicyConnectionSyncProgress, 'connectionName' | 'result'> | null>(null);

    // The backend sends the `JOB_DONE` stage and the result in separate Onyx updates, and it does not
    // guarantee their order. Therefore we cannot key the screen on the render that first shows `JOB_DONE`.
    // We instead remember that this mount watched a sync run, and we open the result one time for that run.
    // A mount that finds a finished sync already in Onyx never saw the run, therefore it opens nothing.
    const didWatchSyncRunRef = useRef(false);
    const [isAnyModalActive] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});

    const connectionName = connectionSyncProgress?.connectionName;
    const openSyncResultsScreen = useEffectEvent((syncResult: PolicyConnectionSyncProgress['result'], syncConnectionName: PolicyConnectionSyncProgress['connectionName']) => {
        if (!syncResult || !syncConnectionName) {
            return;
        }

        // The result payload stays in Onyx; the screen re-reads it from the `policyID` it inherits
        // from the workspace route, so nothing rich has to be serialized into navigation params.
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path));
    });

    useEffect(() => {
        const syncResult = connectionSyncProgress?.result;
        const stageInProgress = connectionSyncProgress?.stageInProgress;
        const isHRConnectionName = CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES.some((hrConnectionName) => hrConnectionName === connectionName);
        const isSyncRunning = isHRConnectionName && !!stageInProgress && stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

        if (isSyncRunning) {
            didWatchSyncRunRef.current = true;
        }

        const isHRSyncDoneWithResult = isHRConnectionName && stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE && !!syncResult;
        const didHRSyncComplete = isFocused && isHRSyncDoneWithResult && didWatchSyncRunRef.current;

        if (didHRSyncComplete && syncResult && connectionName) {
            pendingSyncResultRef.current = {connectionName, result: syncResult};
            didWatchSyncRunRef.current = false;
        }

        const pendingSyncResult = pendingSyncResultRef.current;
        if (!pendingSyncResult || isAnyModalActive) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                openSyncResultsScreen(pendingSyncResult.result, pendingSyncResult.connectionName);
                pendingSyncResultRef.current = null;
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [connectionName, connectionSyncProgress?.result, connectionSyncProgress?.stageInProgress, connectionSyncProgress?.timestamp, isAnyModalActive, isFocused]);
}

export default useHRSyncResultsPage;
