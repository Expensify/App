import {useEffect, useState} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {TranslationParameters} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

type ImportSpreadsheetConfirmModalProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A function to close both the import page and the modal. */
    closeImportPageAndModal: () => void;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** Whether to handle navigation back when modal visibility changes. */
    shouldHandleNavigationBack?: boolean;
};

function ImportSpreadsheetConfirmModal({isVisible, closeImportPageAndModal, onModalHide, shouldHandleNavigationBack = true}: ImportSpreadsheetConfirmModalProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const [titleText, setTitleText] = useState('');
    const [promptText, setPromptText] = useState('');

    useEffect(() => {
        if (!isVisible || !spreadsheet?.importFinalModal) {
            return;
        }
        const title = spreadsheet.importFinalModal.titleKey ? translate(spreadsheet.importFinalModal.titleKey) : '';
        const prompt = spreadsheet.importFinalModal.promptKey
            ? translate(spreadsheet.importFinalModal.promptKey, spreadsheet.importFinalModal.promptKeyParams as TranslationParameters<typeof spreadsheet.importFinalModal.promptKey>[0])
            : '';
        setTitleText(title);
        setPromptText(prompt);
    }, [isVisible, spreadsheet, translate]);

    useEffect(() => {
        if (!isVisible || !titleText || !promptText) {
            return;
        }
        showConfirmModal({
            title: titleText,
            prompt: promptText,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldHandleNavigationBack,
            onModalHide,
        }).then(() => {
            closeImportPageAndModal();
        });
    }, [isVisible, titleText, promptText, closeImportPageAndModal, onModalHide, shouldHandleNavigationBack, showConfirmModal, translate]);

    return null;
}

export default ImportSpreadsheetConfirmModal;
