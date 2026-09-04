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
import usePrevious from './usePrevious';

/**
 * Watches an HR provider's sync progress and automatically opens the HR sync results screen
 * when the sync transitions to the `JOB_DONE` stage with a result payload.
 */
function useHRSyncResultsPage(connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const previousSyncProgress = usePrevious(connectionSyncProgress);
    const pendingSyncResultRef = useRef<Pick<PolicyConnectionSyncProgress, 'connectionName' | 'result'> | null>(null);
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
                openSyncResultsScreen(pendingSyncResult.result, pendingSyncResult.connectionName);
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

export default useHRSyncResultsPage;
