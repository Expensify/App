import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {TranslationParameters} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

type ImportSpreadsheetConfirmModalProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A function to close both the import page and the modal. */
    closeImportPageAndModal: () => void;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;
};

function ImportSpreadsheetConfirmModal({isVisible, closeImportPageAndModal, onModalHide}: ImportSpreadsheetConfirmModalProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const titleText = spreadsheet?.importFinalModal?.titleKey ? translate(spreadsheet.importFinalModal.titleKey) : '';
    const promptText = spreadsheet?.importFinalModal?.promptKey
        ? translate(spreadsheet.importFinalModal.promptKey, spreadsheet.importFinalModal.promptKeyParams as TranslationParameters<typeof spreadsheet.importFinalModal.promptKey>[0])
        : '';

    return (
        <ConfirmModal
            isVisible={isVisible}
            title={titleText}
            prompt={promptText}
            onConfirm={closeImportPageAndModal}
            onCancel={closeImportPageAndModal}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
            shouldHandleNavigationBack
            onModalHide={onModalHide}
        />
    );
}

ImportSpreadsheetConfirmModal.displayName = 'ImportSpreadsheetConfirmModal';

export default ImportSpreadsheetConfirmModal;
