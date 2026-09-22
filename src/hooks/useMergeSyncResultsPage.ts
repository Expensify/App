import type {HRConnectionName} from '@libs/merge/HRUtils';
import type {RecruitingConnectionName} from '@libs/merge/RecruitingUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ConnectionName, PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

import {useIsFocused} from '@react-navigation/native';
import {isModalActiveSelector} from '@selectors/Modal';
import {useEffect, useEffectEvent, useRef} from 'react';

import useOnyx from './useOnyx';

function getSyncResultsRoutePath(connectionName: ConnectionName | undefined) {
    if (CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES.some((hrConnectionName) => hrConnectionName === connectionName)) {
        return DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path;
    }
    if (CONST.POLICY.CONNECTIONS.RECRUITING_CONNECTION_NAMES.some((recruitingConnectionName) => recruitingConnectionName === connectionName)) {
        return DYNAMIC_ROUTES.WORKSPACE_RECRUITING_SYNC_RESULTS.path;
    }
    return undefined;
}

/**
 * Watches an HR or recruiting provider's sync progress and automatically opens that category's sync results
 * screen when the sync reaches the `JOB_DONE` stage with a result payload.
 *
 * Pass `connectionName` to watch one provider only, which a screen that knows which provider it is showing should do so
 * that the sync of another integration of the same workspace never opens its results. Leave it out to watch whichever
 * HR or recruiting provider syncs.
 */
function useMergeSyncResultsPage(policyID: string, connectionName?: HRConnectionName | RecruitingConnectionName) {
    const isFocused = useIsFocused();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const pendingSyncResultRef = useRef<Pick<PolicyConnectionSyncProgress, 'connectionName' | 'result'> | null>(null);

    // The backend sends the `JOB_DONE` stage and the result in separate Onyx updates, and it does not
    // guarantee their order. Therefore we cannot key the screen on the render that first shows `JOB_DONE`.
    // We instead remember that this mount watched a sync run, and we open the result one time for that run.
    // A mount that finds a finished sync already in Onyx never saw the run, therefore it opens nothing.
    const didWatchSyncRunRef = useRef(false);
    const [isAnyModalActive] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});

    const syncConnectionName = connectionSyncProgress?.connectionName;
    const openSyncResultsScreen = useEffectEvent((syncResult: PolicyConnectionSyncProgress['result'], syncedConnectionName: PolicyConnectionSyncProgress['connectionName']) => {
        const routePath = getSyncResultsRoutePath(syncedConnectionName);
        if (!syncResult || !routePath) {
            return;
        }

        // The result payload stays in Onyx; the screen re-reads it from the `policyID` it inherits
        // from the workspace route, so nothing rich has to be serialized into navigation params.
        Navigation.navigate(createDynamicRoute(routePath));
    });

    useEffect(() => {
        const isSyncForThisConnection = !connectionName || syncConnectionName === connectionName;
        const syncResult = isSyncForThisConnection ? connectionSyncProgress?.result : undefined;
        const stageInProgress = isSyncForThisConnection ? connectionSyncProgress?.stageInProgress : undefined;
        const hasResultsScreen = !!getSyncResultsRoutePath(syncConnectionName);
        const isSyncRunning = hasResultsScreen && !!stageInProgress && stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

        if (isSyncRunning) {
            didWatchSyncRunRef.current = true;
        }

        const isSyncDoneWithResult = hasResultsScreen && stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE && !!syncResult;
        const didSyncComplete = isFocused && isSyncDoneWithResult && didWatchSyncRunRef.current;

        if (didSyncComplete && syncResult && syncConnectionName) {
            pendingSyncResultRef.current = {connectionName: syncConnectionName, result: syncResult};
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
    }, [connectionName, syncConnectionName, connectionSyncProgress?.result, connectionSyncProgress?.stageInProgress, connectionSyncProgress?.timestamp, isAnyModalActive, isFocused]);
}

export default useMergeSyncResultsPage;
