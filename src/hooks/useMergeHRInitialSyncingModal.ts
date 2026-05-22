import {useEffect, useEffectEvent} from 'react';
import {setMergeHRInitialSyncModalShown} from '@libs/actions/connections/MergeHR';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

/**
 * Shows a one-time informational modal when the Merge HR connection's initial sync is in progress.
 */
function useMergeHRInitialSyncingModal(policyID: string, isFocused: boolean) {
    const policy = usePolicy(policyID);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const [hasShownModal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN}${policyID}`);

    const showSyncingModal = useEffectEvent(() => {
        if (hasShownModal) {
            return;
        }
        setMergeHRInitialSyncModalShown(policyID);
        showConfirmModal({
            id: `merge-hr-syncing-${policyID}`,
            title: translate('workspace.hr.syncingModalTitle'),
            prompt: translate('workspace.hr.syncingModalDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    });

    const mergeLastSync = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]?.lastSync;

    useEffect(() => {
        const isInitialSyncInProgress = mergeLastSync?.syncStatus === CONST.MERGE_HR.SYNC_STATUS.SYNCING && mergeLastSync?.syncType === CONST.MERGE_HR.SYNC_TYPE.INITIAL;

        if (!isFocused || !isInitialSyncInProgress) {
            return;
        }

        showSyncingModal();
    }, [mergeLastSync?.syncStatus, mergeLastSync?.syncType, isFocused]);
}

export default useMergeHRInitialSyncingModal;
