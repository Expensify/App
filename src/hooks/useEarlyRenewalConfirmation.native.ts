import useConfirmModal from './useConfirmModal';
import useEarlyRenewalPeriod from './useEarlyRenewalPeriod';
import useLocalize from './useLocalize';

/** Explains that early renewal offers can't be accepted in the native mobile app and points the user to the browser. */
function useEarlyRenewalConfirmation() {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const {isIncentivizedPeriod} = useEarlyRenewalPeriod();

    const showEarlyRenewalConfirmation = () => {
        return showConfirmModal({
            title: isIncentivizedPeriod ? translate('earlyRenewal.incentivizedTitle') : translate('earlyRenewal.title'),
            prompt: isIncentivizedPeriod ? translate('earlyRenewal.mobileClaimPrompt') : translate('earlyRenewal.mobileRenewPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldEnableNewFocusManagement: true,
        });
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
