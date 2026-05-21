import {useEffect, useEffectEvent} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {setMergeHRInitialSyncModalShown} from '@libs/actions/connections/MergeHR';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Shows a one-time informational modal when the Merge HR connection's first backend-initiated sync starts.
 * The modal is suppressed for subsequent page loads during the same sync by persisting the sync timestamp in Onyx.
 */
function useMergeHRInitialSyncingModal(policyID: string, connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>, isFocused: boolean) {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const [shownForTimestamp] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN}${policyID}`);

    const showSyncingModal = useEffectEvent((timestamp: string) => {
        if (shownForTimestamp === timestamp) {
            return;
        }
        setMergeHRInitialSyncModalShown(policyID, timestamp);
        showConfirmModal({
            id: `merge-hr-syncing-${policyID}`,
            title: translate('workspace.hr.syncingModalTitle'),
            prompt: translate('workspace.hr.syncingModalDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    });

    useEffect(() => {
        const isMergeHRInitialSyncStarting =
            connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR &&
            connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE &&
            connectionSyncProgress?.isInitialSync;

        if (!isFocused || !isMergeHRInitialSyncStarting || !connectionSyncProgress?.timestamp) {
            return;
        }

        showSyncingModal(connectionSyncProgress.timestamp);
    }, [connectionSyncProgress?.connectionName, connectionSyncProgress?.stageInProgress, connectionSyncProgress?.isInitialSync, connectionSyncProgress?.timestamp, isFocused]);
}

export default useMergeHRInitialSyncingModal;
