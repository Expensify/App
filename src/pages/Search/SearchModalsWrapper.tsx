import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';

type SearchModalsWrapperProps = {
    isDeleteExpensesConfirmModalVisible: boolean;
    handleDeleteExpenses: () => void;
    setIsDeleteExpensesConfirmModalVisible: (value: ((prevState: boolean) => boolean) | boolean) => void;
    selectedTransactionsKeys: string[];
    setIsOfflineModalVisible: (value: ((prevState: boolean) => boolean) | boolean) => void;
    isOfflineModalVisible: boolean;
    setIsDownloadErrorModalVisible: (value: ((prevState: boolean) => boolean) | boolean) => void;
    isDownloadErrorModalVisible: boolean;
    isExportWithTemplateModalVisible: boolean;
    setIsExportWithTemplateModalVisible: (value: ((prevState: boolean) => boolean) | boolean) => void;
    clearSelectedTransactions: {(hash?: number, shouldTurnOffSelectionMode?: boolean): void; (clearIDs: true, unused?: undefined): void};
    isDEWModalVisible: boolean;
    setIsDEWModalVisible: (value: ((prevState: boolean) => boolean) | boolean) => void;
    isDownloadExportModalVisible?: boolean;
    createExportAll?: () => void;
    setIsDownloadExportModalVisible?: (value: ((prevState: boolean) => boolean) | boolean) => void;
};

function SearchModalsWrapper({
    isDeleteExpensesConfirmModalVisible,
    handleDeleteExpenses,
    setIsDeleteExpensesConfirmModalVisible,
    selectedTransactionsKeys,
    setIsOfflineModalVisible,
    isOfflineModalVisible,
    setIsDownloadErrorModalVisible,
    isDownloadErrorModalVisible,
    isExportWithTemplateModalVisible,
    setIsExportWithTemplateModalVisible,
    clearSelectedTransactions,
    isDEWModalVisible,
    setIsDEWModalVisible,
    isDownloadExportModalVisible,
    createExportAll,
    setIsDownloadExportModalVisible,
}: SearchModalsWrapperProps) {
    const {translate} = useLocalize();

    const handleDeleteExpensesCancel = useCallback(() => {
        setIsDeleteExpensesConfirmModalVisible(false);
    }, [setIsDeleteExpensesConfirmModalVisible]);

    const handleOfflineModalClose = useCallback(() => {
        setIsOfflineModalVisible(false);
    }, [setIsOfflineModalVisible]);

    const handleDownloadErrorModalClose = useCallback(() => {
        setIsDownloadErrorModalVisible(false);
    }, [setIsDownloadErrorModalVisible]);

    const handleExportWithTemplateConfirm = useCallback(() => {
        setIsExportWithTemplateModalVisible(false);
        clearSelectedTransactions(undefined, true);
    }, [setIsExportWithTemplateModalVisible, clearSelectedTransactions]);

    const handleExportWithTemplateCancel = useCallback(() => {
        setIsExportWithTemplateModalVisible(false);
    }, [setIsExportWithTemplateModalVisible]);

    const handleDEWModalConfirm = useCallback(() => {
        setIsDEWModalVisible(false);
        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
    }, [setIsDEWModalVisible]);

    const handleDEWModalCancel = useCallback(() => {
        setIsDEWModalVisible(false);
    }, [setIsDEWModalVisible]);

    const handleDownloadExportModalCancel = useCallback(() => {
        setIsDownloadExportModalVisible?.(false);
    }, [setIsDownloadExportModalVisible]);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    const isPossibleToShowDownloadExportModal = !shouldUseNarrowLayout && !!isDownloadExportModalVisible && !!createExportAll && !!setIsDownloadExportModalVisible;
    return (
        <View>
            <ConfirmModal
                isVisible={isDeleteExpensesConfirmModalVisible}
                onConfirm={handleDeleteExpenses}
                onCancel={handleDeleteExpensesCancel}
                title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={handleOfflineModalClose}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isOfflineModalVisible}
                onClose={handleOfflineModalClose}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={handleDownloadErrorModalClose}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={handleDownloadErrorModalClose}
            />
            <ConfirmModal
                isVisible={isExportWithTemplateModalVisible}
                onConfirm={handleExportWithTemplateConfirm}
                onCancel={handleExportWithTemplateCancel}
                title={translate('export.exportInProgress')}
                prompt={translate('export.conciergeWillSend')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('customApprovalWorkflow.title')}
                isVisible={isDEWModalVisible}
                onConfirm={handleDEWModalConfirm}
                onCancel={handleDEWModalCancel}
                prompt={translate('customApprovalWorkflow.description')}
                confirmText={translate('customApprovalWorkflow.goToExpensifyClassic')}
                shouldShowCancelButton={false}
            />
            {isPossibleToShowDownloadExportModal && (
                <ConfirmModal
                    isVisible={isDownloadExportModalVisible}
                    onConfirm={createExportAll}
                    onCancel={handleDownloadExportModalCancel}
                    title={translate('search.exportSearchResults.title')}
                    prompt={translate('search.exportSearchResults.description')}
                    confirmText={translate('search.exportSearchResults.title')}
                    cancelText={translate('common.cancel')}
                />
            )}
        </View>
    );
}

SearchModalsWrapper.displayName = 'SearchModalsWrapper';

export default SearchModalsWrapper;
