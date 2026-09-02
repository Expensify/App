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

        // `translate` can't infer parameter types from a union of translation paths, so the assertion is
        // unavoidable. Both messages below need it, so it lives in one place rather than at each call.
        const translateKey = (key: ImportFinalModal['promptKey'], params?: ImportFinalModal['promptKeyParams'] | ImportFinalModal['pendingMessageKeyParams']) =>
            translate(key, params as TranslationParameters<typeof key>[0]);

        const titleText = translate(importFinalModal.titleKey);
        const promptText = translateKey(importFinalModal.promptKey, importFinalModal.promptKeyParams);
        const pendingText = importFinalModal.pendingMessageKey ? translateKey(importFinalModal.pendingMessageKey, importFinalModal.pendingMessageKeyParams) : '';
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
