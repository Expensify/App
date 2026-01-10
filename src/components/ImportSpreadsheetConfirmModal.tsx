import React, {useEffect, useState} from 'react';
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

    /** Whether to handle navigation back when modal visibility changes. */
    shouldHandleNavigationBack?: boolean;
};

function ImportSpreadsheetConfirmModal({isVisible, closeImportPageAndModal, onModalHide, shouldHandleNavigationBack = true}: ImportSpreadsheetConfirmModalProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const [titleText, setTitleText] = useState('');
    const [promptText, setPromptText] = useState('');

    useEffect(() => {
        if (!isVisible || !spreadsheet?.importFinalModal) {
            return;
        }
        const title = spreadsheet.importFinalModal.titleKey ? translate(spreadsheet.importFinalModal.titleKey) : '';

        // Workaround for old data persisted in Onyx after a version update
        let params: unknown[] = [];
        if (spreadsheet.importFinalModal.promptKey) {
            if (Array.isArray(spreadsheet.importFinalModal.promptKeyParams)) {
                params = spreadsheet.importFinalModal.promptKeyParams;
            } else if (typeof spreadsheet.importFinalModal.promptKeyParams === 'object') {
                const legacy = spreadsheet.importFinalModal.promptKeyParams as Record<string, unknown>;
                params = 'added' in legacy && 'updated' in legacy ? [legacy.added, legacy.updated] : Object.values(legacy);
            }
        }

        const prompt = spreadsheet.importFinalModal.promptKey
            ? translate(spreadsheet.importFinalModal.promptKey, ...(params as TranslationParameters<typeof spreadsheet.importFinalModal.promptKey>))
            : '';
        setTitleText(title);
        setPromptText(prompt);
    }, [isVisible, spreadsheet, translate]);

    return (
        <ConfirmModal
            isVisible={isVisible}
            title={titleText}
            prompt={promptText}
            onConfirm={closeImportPageAndModal}
            onCancel={closeImportPageAndModal}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            onModalHide={onModalHide}
        />
    );
}

export default ImportSpreadsheetConfirmModal;
