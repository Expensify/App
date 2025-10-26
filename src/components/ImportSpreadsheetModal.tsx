import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {TranslationParameters} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

type ImportSpreadsheetModalProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A function to close both the import page and the modal. */
    closeImportPageAndModal: () => void;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;
};

function ImportSpreadsheetModal({isVisible, closeImportPageAndModal, onModalHide}: ImportSpreadsheetModalProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const titleText = spreadsheet?.importFinalModal?.title ? translate(spreadsheet.importFinalModal.title) : '';
    const promptText = spreadsheet?.importFinalModal?.prompt
        ? translate(spreadsheet.importFinalModal.prompt, spreadsheet.importFinalModal.params as TranslationParameters<typeof spreadsheet.importFinalModal.prompt>[0])
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

ImportSpreadsheetModal.displayName = 'ImportSpreadsheetModal';

export default ImportSpreadsheetModal;
