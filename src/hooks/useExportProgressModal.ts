import {useCallback} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryString} from '@components/Search/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanel from '@hooks/useSidePanel';
import {queueExportSearchWithTemplate as queueExportSearchWithTemplateAction} from '@libs/actions/Search';
import {ExportSearchWithTemplateParams} from '@libs/API/parameters';

/**
 * Hook that provides a standardized export progress modal with an optional "Open Concierge" button.
 * The "Open Concierge" button is only shown on wide layouts and opens the side panel when clicked.
 * When the user confirms, it automatically clears the selected transactions.
 */
function useExportProgressModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {openSidePanel} = useSidePanel();
    const {clearSelectedTransactions} = useSearchContext();

    const showExportProgressModal = useCallback(async () => {
        const result = await showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            cancelText: translate('export.openConcierge'),
            shouldShowCancelButton: !shouldUseNarrowLayout,
        });

        if (result.action === ModalActions.CLOSE) {
            openSidePanel();
        }

        if (result.action === ModalActions.CONFIRM) {
            clearSelectedTransactions(undefined, true);
        }

        return result;
    }, [showConfirmModal, translate, shouldUseNarrowLayout, openSidePanel, clearSelectedTransactions]);

    /**
     * Queues an export with the specified template and shows the export progress modal.
     * This wraps both the API call and the modal display in a single function.
     */
    const queueExportSearchWithTemplate = useCallback(
        (params: ExportSearchWithTemplateParams) => {
            queueExportSearchWithTemplateAction(params);
            showExportProgressModal();
        },
        [showExportProgressModal],
    );

    return {queueExportSearchWithTemplate};
}

export default useExportProgressModal;
