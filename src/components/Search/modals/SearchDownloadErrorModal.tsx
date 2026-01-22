import React from 'react';
import DecisionModal from '@components/DecisionModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

type SearchDownloadErrorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;
    /** Callback when the modal is closed */
    onClose: () => void;
};

/**
 * Self-contained download error modal for the Search page
 * Following composition pattern - manages its own rendering based on props
 */
function SearchDownloadErrorModal({isVisible, onClose}: SearchDownloadErrorModalProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <DecisionModal
            title={translate('common.downloadFailedTitle')}
            prompt={translate('common.downloadFailedDescription')}
            isSmallScreenWidth={isSmallScreenWidth}
            onSecondOptionSubmit={onClose}
            secondOptionText={translate('common.buttonConfirm')}
            isVisible={isVisible}
            onClose={onClose}
        />
    );
}

SearchDownloadErrorModal.displayName = 'SearchDownloadErrorModal';

export default SearchDownloadErrorModal;
export type {SearchDownloadErrorModalProps};
