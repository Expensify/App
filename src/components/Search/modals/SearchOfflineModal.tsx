import React from 'react';
import DecisionModal from '@components/DecisionModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

type SearchOfflineModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;
    /** Callback when the modal is closed */
    onClose: () => void;
};

/**
 * Self-contained offline modal for the Search page
 * Following composition pattern - manages its own rendering based on props
 */
function SearchOfflineModal({isVisible, onClose}: SearchOfflineModalProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <DecisionModal
            title={translate('common.youAppearToBeOffline')}
            prompt={translate('common.offlinePrompt')}
            isSmallScreenWidth={isSmallScreenWidth}
            onSecondOptionSubmit={onClose}
            secondOptionText={translate('common.buttonConfirm')}
            isVisible={isVisible}
            onClose={onClose}
        />
    );
}

SearchOfflineModal.displayName = 'SearchOfflineModal';

export default SearchOfflineModal;
export type {SearchOfflineModalProps};
