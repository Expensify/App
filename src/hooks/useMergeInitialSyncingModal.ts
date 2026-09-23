import {MERGE_INITIAL_SYNC_MODAL_SHOWN_KEYS, setMergeInitialSyncModalShown} from '@libs/actions/connections/merge';
import type {MergeConnectionName} from '@libs/merge/MergeUtils';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import Visibility from '@libs/Visibility';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent, useState} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

/**
 * Shows a one-time informational modal when the given Merge connection's initial sync is in progress.
 */
function useMergeInitialSyncingModal(policyID: string, connectionName: MergeConnectionName, isFocused: boolean) {
    const policy = usePolicy(policyID);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const [hasShownModal] = useOnyx(`${MERGE_INITIAL_SYNC_MODAL_SHOWN_KEYS[connectionName]}${policyID}`);
    const [isAppVisible, setIsAppVisible] = useState(Visibility.isVisible);
    const [isAnyModalVisible] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => !!modal?.isVisible});

    useEffect(() => Visibility.onVisibilityChange(() => setIsAppVisible(Visibility.isVisible())), []);

    const showSyncingModal = useEffectEvent(() => {
        if (hasShownModal) {
            return;
        }
        setMergeInitialSyncModalShown(policyID, connectionName);
        showConfirmModal({
            id: `merge-syncing-${connectionName}-${policyID}`,
            title: translate('workspace.merge.syncingModalTitle'),
            prompt: translate('workspace.merge.syncingModalDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    });

    const mergeLastSync = policy?.connections?.[connectionName]?.lastSync;

    useEffect(() => {
        const isInitialSyncInProgress = mergeLastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.SYNCING && mergeLastSync?.syncType === CONST.MERGE.SYNC_TYPE.INITIAL;
        if (!isFocused || !isInitialSyncInProgress || !isAppVisible || isAnyModalVisible) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({callback: showSyncingModal, waitForUpcomingTransition: true});
        return () => handle.cancel();
    }, [mergeLastSync?.syncStatus, mergeLastSync?.syncType, isFocused, isAppVisible, isAnyModalVisible]);
}

export default useMergeInitialSyncingModal;
