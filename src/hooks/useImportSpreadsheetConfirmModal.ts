import type {TranslationParameters} from '@src/languages/types';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';

import useConfirmModal from './useConfirmModal';
import useIsFocusedRef from './useIsFocusedRef';
import useLocalize from './useLocalize';

type ShowImportSpreadsheetConfirmModalOptions = {
    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** Whether to handle navigation back when modal visibility changes. */
    shouldHandleNavigationBack?: boolean;
};

function useImportSpreadsheetConfirmModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const isFocusedRef = useIsFocusedRef();

    return async (importFinalModal: ImportFinalModal, {onModalHide, shouldHandleNavigationBack = true}: ShowImportSpreadsheetConfirmModalOptions = {}) => {
        if (!isFocusedRef.current) {
            return false;
        }

        const titleText = translate(importFinalModal.titleKey);
        const promptText = translate(importFinalModal.promptKey, importFinalModal.promptKeyParams as TranslationParameters<typeof importFinalModal.promptKey>[0]);
        const pendingText = importFinalModal.pendingMessageKey ? translate(importFinalModal.pendingMessageKey) : '';
        const fullPromptText = pendingText ? `${promptText} ${pendingText}` : promptText;

        await showConfirmModal({
            id: 'import-spreadsheet-confirm-modal',
            title: titleText,
            prompt: fullPromptText,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldHandleNavigationBack,
            onModalHide,
        });

        return true;
    };
}

export default useImportSpreadsheetConfirmModal;
