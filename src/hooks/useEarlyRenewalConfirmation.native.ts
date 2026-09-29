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
            title: isIncentivizedPeriod ? translate('earlyRenewal.incentivizedTitle') : translate('earlyRenewal.title'),
            prompt: translate('subscription.mobileReducedFunctionalityMessage'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldEnableNewFocusManagement: true,
        });
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
