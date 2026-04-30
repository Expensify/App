import type {TranslationParameters} from '@src/languages/types';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type ShowImportSpreadsheetConfirmModalOptions = ImportFinalModal & {
    /** Whether to handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;
};

function useImportSpreadsheetConfirmModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showImportSpreadsheetConfirmModal = ({titleKey, promptKey, promptKeyParams, shouldHandleNavigationBack = true, onModalHide}: ShowImportSpreadsheetConfirmModalOptions) =>
        showConfirmModal({
            id: 'import-spreadsheet-confirm-modal',
            title: translate(titleKey),
            prompt: translate(promptKey, promptKeyParams as TranslationParameters<typeof promptKey>[0]),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldHandleNavigationBack,
            onModalHide,
        });

    return {showImportSpreadsheetConfirmModal};
}

export default useImportSpreadsheetConfirmModal;
