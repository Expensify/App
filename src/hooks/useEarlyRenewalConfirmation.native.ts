import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/** Explains why early renewal offers cannot be accepted in the native mobile app. */
function useEarlyRenewalConfirmation() {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    const showEarlyRenewalConfirmation = () => {
        return showConfirmModal({
            title: translate('earlyRenewal.title'),
            prompt: translate('subscription.mobileReducedFunctionalityMessage'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldEnableNewFocusManagement: true,
        });
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
