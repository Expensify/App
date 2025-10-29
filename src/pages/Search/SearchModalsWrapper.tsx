import React from 'react';
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const isPossibleToShowDownloadExportModal = !shouldUseNarrowLayout && !!isDownloadExportModalVisible && !!createExportAll && !!setIsDownloadExportModalVisible;
    return (
        <View>
            <ConfirmModal
                isVisible={isDeleteExpensesConfirmModalVisible}
                onConfirm={handleDeleteExpenses}
                onCancel={() => {
                    setIsDeleteExpensesConfirmModalVisible(false);
                }}
                title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isOfflineModalVisible}
                onClose={() => setIsOfflineModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                isVisible={isExportWithTemplateModalVisible}
                onConfirm={() => {
                    setIsExportWithTemplateModalVisible(false);
                    clearSelectedTransactions(undefined, true);
                }}
                onCancel={() => setIsExportWithTemplateModalVisible(false)}
                title={translate('export.exportInProgress')}
                prompt={translate('export.conciergeWillSend')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('customApprovalWorkflow.title')}
                isVisible={isDEWModalVisible}
                onConfirm={() => {
                    setIsDEWModalVisible(false);
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
                onCancel={() => setIsDEWModalVisible(false)}
                prompt={translate('customApprovalWorkflow.description')}
                confirmText={translate('customApprovalWorkflow.goToExpensifyClassic')}
                shouldShowCancelButton={false}
            />
            {isPossibleToShowDownloadExportModal && (
                <ConfirmModal
                    isVisible={isDownloadExportModalVisible}
                    onConfirm={createExportAll}
                    onCancel={() => {
                        setIsDownloadExportModalVisible(false);
                    }}
                    title={translate('search.exportSearchResults.title')}
                    prompt={translate('search.exportSearchResults.description')}
                    confirmText={translate('search.exportSearchResults.title')}
                    cancelText={translate('common.cancel')}
                />
            )}
        </View>
    );
}

export default SearchModalsWrapper;
