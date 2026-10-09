import useDecisionModal from './useDecisionModal';
import useLocalize from './useLocalize';

/**
 * Provides the one-button "You appear to be offline" and "Download failed" alerts shown through the global decision modal.
 */
function useAlertModals() {
    const {translate} = useLocalize();
    const {showDecisionModal} = useDecisionModal();

    const showOfflineModal = () => {
        showDecisionModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const showDownloadErrorModal = () => {
        showDecisionModal({
            title: translate('common.downloadFailedTitle'),
            prompt: translate('common.downloadFailedDescription'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    return {showOfflineModal, showDownloadErrorModal};
}

export default useAlertModals;
