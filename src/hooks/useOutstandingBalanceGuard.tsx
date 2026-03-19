import React, {useCallback, useMemo, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Hook that encapsulates the outstanding balance guard logic for workspace deletion.
 * When the user tries to delete their last paid workspace while owing a balance,
 * a modal is shown directing them to subscription settings to settle the balance.
 *
 * @param ownedPaidPoliciesCount - The number of paid policies the current user owns
 * @returns shouldBlockDeletion - function that checks and shows the modal if needed (returns true if blocked)
 * @returns wouldBlockDeletion - pre-computed boolean for popover/menu configuration
 * @returns outstandingBalanceModal - React element to render in the page
 */
function useOutstandingBalanceGuard(ownedPaidPoliciesCount: number) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {translate} = useLocalize();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const wouldBlockDeletion = (amountOwed ?? 0) > 0 && ownedPaidPoliciesCount === 1;

    const shouldBlockDeletion = useCallback(() => {
        if (wouldBlockDeletion) {
            setIsModalOpen(true);
            return true;
        }
        return false;
    }, [wouldBlockDeletion]);

    const outstandingBalanceModal = useMemo(
        () => (
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isModalOpen}
                onConfirm={() => {
                    setIsModalOpen(false);
                    Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route);
                }}
                onCancel={() => setIsModalOpen(false)}
                prompt={translate('workspace.common.outstandingBalanceWarning')}
                confirmText={translate('workspace.common.settleBalance')}
                cancelText={translate('common.cancel')}
            />
        ),
        [isModalOpen, translate],
    );

    return {shouldBlockDeletion, wouldBlockDeletion, outstandingBalanceModal};
}

export default useOutstandingBalanceGuard;
