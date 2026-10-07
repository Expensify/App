import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {close} from '@libs/actions/Modal';
import {unarchivePolicy} from '@libs/actions/Policy/Policy';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useRef} from 'react';

type UnarchiveWorkspaceFlowProps = {
    /** ID of the workspace being unarchived */
    policyID: string;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;
};

/**
 * Self-contained workspace unarchive flow, mounted only while an unarchive is in progress so the policy entry
 * is subscribed to only for the lifetime of the flow.
 *
 * Unarchiving is online only: it unlocks writes on the policy, so any edit made afterward depends on it, and the
 * archived policy data available locally may be incomplete. While offline we show the offline modal instead.
 */
function UnarchiveWorkspaceFlow({policyID, onDismiss}: UnarchiveWorkspaceFlowProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const isLoadingData = isLoadingOnyxValue(policyResult);

    // Closes the popover (if still open) and shows the confirmation modal once the policy entry has loaded.
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        close(() => {
            if (isOffline) {
                showConfirmModal({
                    title: translate('common.youAppearToBeOffline'),
                    prompt: translate('common.offlinePrompt'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                }).then(() => onDismiss());
                return;
            }

            showConfirmModal({
                title: translate('workspace.common.unarchiveWorkspace'),
                prompt: translate('workspace.common.unarchiveConfirmation'),
                confirmText: translate('workspace.common.unarchive'),
                cancelText: translate('common.cancel'),
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM) {
                    unarchivePolicy({
                        policyID,
                        policyName: policy?.name,
                        archivedDate: policy?.archivedDate,
                    });
                }
                onDismiss();
            });
        });
    });

    // Every modal this flow shows is owned by the global modal stack, so the flow itself renders nothing.
    return null;
}

export default UnarchiveWorkspaceFlow;
