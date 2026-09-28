import CONST from '@src/CONST';

import useConfirmModal from './useConfirmModal';
import useEarlyRenewalPeriod from './useEarlyRenewalPeriod';
import useLocalize from './useLocalize';

/** Explains why early renewal offers cannot be accepted in the native mobile app. */
function useEarlyRenewalConfirmation() {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const {isIncentivizedPeriod} = useEarlyRenewalPeriod();

    const showEarlyRenewalConfirmation = () => {
        return showConfirmModal({
            title: isIncentivizedPeriod ? translate('earlyRenewal.incentivizedTitle') : CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER.HOME_TITLE,
            prompt: translate('subscription.mobileReducedFunctionalityMessage'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldEnableNewFocusManagement: true,
        });
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
