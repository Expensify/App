import {useCallback} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm pending RTER violations before proceeding with an action.
 * If there are pending RTER violations, a confirmation modal is shown asking the user to mark them as cash.
 */
function useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation: boolean, onMarkAsCash: () => void) {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    return useCallback(
        (onProceed: () => void) => {
            if (!hasAnyPendingRTERViolation) {
                onProceed();
                return;
            }
            showConfirmModal({
                title: translate('iou.pendingMatchSubmitTitle'),
                prompt: translate('iou.pendingMatchSubmitDescription'),
                confirmText: translate('common.yes'),
                cancelText: translate('common.no'),
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM) {
                    onMarkAsCash();
                }
                onProceed();
            });
        },
        [hasAnyPendingRTERViolation, showConfirmModal, translate, onMarkAsCash],
    );
}

export default useConfirmPendingRTERAndProceed;
