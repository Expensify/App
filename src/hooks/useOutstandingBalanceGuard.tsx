import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type OutstandingBalanceGuardParams = {
    /** The number of paid policies the current user owns */
    ownedPaidPoliciesCount: number;

    /** Whether the guard runs for an archive rather than a delete, so the modal names the action the user actually triggered */
    isArchiving: boolean;

    /** Called when the modal is dismissed (either by settling the balance or cancelling) */
    onModalDismissed?: () => void;
};

/**
 * Hook that encapsulates the outstanding balance guard logic for removing a workspace.
 * When the user tries to delete or archive their last paid workspace while owing a balance,
 * a modal is shown directing them to subscription settings to settle the balance.
 *
 * @returns shouldBlockDeletion - function that checks and shows the modal if needed (returns true if blocked)
 * @returns wouldBlockDeletion - pre-computed boolean for popover/menu configuration
 */
function useOutstandingBalanceGuard({ownedPaidPoliciesCount, isArchiving, onModalDismissed}: OutstandingBalanceGuardParams) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const wouldBlockDeletion = (amountOwed ?? 0) > 0 && ownedPaidPoliciesCount === 1;

    const shouldBlockDeletion = useCallback(() => {
        if (!wouldBlockDeletion) {
            return false;
        }

        showConfirmModal({
            title: translate(isArchiving ? 'workspace.common.archive' : 'workspace.common.delete'),
            prompt: translate(isArchiving ? 'workspace.common.outstandingBalanceArchiveWarning' : 'workspace.common.outstandingBalanceWarning'),
            confirmText: translate('workspace.common.settleBalance'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action === ModalActions.CONFIRM) {
                Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route);
            }

            onModalDismissed?.();
        });

        return true;
    }, [isArchiving, onModalDismissed, showConfirmModal, translate, wouldBlockDeletion]);

    return {shouldBlockDeletion, wouldBlockDeletion};
}

export default useOutstandingBalanceGuard;
