import DecisionModal from '@components/DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import {ReportSubmitToPopoverAnchor} from '@components/ReportSubmitToPopoverAnchor';
import BulkDuplicateHandler from '@components/Search/BulkDuplicateHandler';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useExportDownloadStatusModal from '@hooks/useExportDownloadStatusModal';
import useFilterSelectedTransactions from '@hooks/useFilterSelectedTransactions';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useSelectionModeReportActions from '@hooks/useSelectionModeReportActions';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissRejectUseExplanation} from '@libs/actions/IOU/RejectMoneyRequest';
import {queueExportSearchWithTemplate} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {getDeleteConfirmationPrompt, getDeleteExpenseTitle, isPending, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';

import SelectAllCheckbox from './SelectAllCheckbox';
import SelectionDropdown from './SelectionDropdown';

type SelectionToolbarProps = {
    /** The reportID of the report */
    reportID: string;

    /** Filtered transactions for this report */
    transactions: OnyxTypes.Transaction[];

    /** Filtered report actions for this report */
    reportActions: OnyxTypes.ReportAction[];
};

function SelectionToolbar({reportID, transactions, reportActions}: SelectionToolbarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetworkWithOfflineStatus();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayoutOnWideRHP();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(reportID)}`);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {setSelectedTransactions, clearSelectedTransactions} = useSearchSelectionActions();

    useFilterSelectedTransactions(transactions, reportID);

    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {showConfirmModal} = useConfirmModal();
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal(() => clearSelectedTransactions(undefined, true));

    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK> | null>(null);

    const transactionsWithoutPendingDelete = transactions.filter((t) => !isTransactionPendingDelete(t));

    const beginExportWithTemplate = (templateName: string, templateType: string, transactionIDList: string[], exportName: string) => {
        if (isOffline) {
            setOfflineModalVisible(true);
            return;
        }

        if (!report) {
            return;
        }

        const exportID = queueExportSearchWithTemplate(
            {
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [report.reportID],
                transactionIDList,
                policyID: policy?.id,
                exportName,
            },
            true,
        );
        trackExport(exportID);
    };

    const onDeleteSelected = (handleDeleteTransactions: () => void, handleDeleteTransactionsWithNavigation: (backToRoute?: Route) => void) => {
        const singleSelectedTransaction = selectedTransactionIDs.length === 1 ? transactions.find((t) => t.transactionID === selectedTransactionIDs.at(0)) : undefined;
        const selectedTransactions = transactions.filter((t) => selectedTransactionIDs.includes(t.transactionID));
        const hasSomePending = selectedTransactionIDs.length > 1 && selectedTransactions.some((t) => isPending(t));
        const deletePrompt = getDeleteConfirmationPrompt(translate, singleSelectedTransaction, selectedTransactionIDs.length, hasSomePending);
        showConfirmModal({
            title: getDeleteExpenseTitle(translate, singleSelectedTransaction, selectedTransactionIDs.length),
            prompt: deletePrompt,
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldEnableNewFocusManagement: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            const shouldNavigateBack = transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length;
            if (shouldNavigateBack) {
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                handleDeleteTransactionsWithNavigation(backToRoute);
                return;
            }
            handleDeleteTransactions();
        });
    };

    const {
        options: originalSelectedTransactionsOptions,
        isDuplicateOptionVisible,
        setDuplicateHandler,
        allTransactions: allTransactionsForDuplicate,
        allReports: allReportsForDuplicate,
    } = useSelectedTransactionsActions({
        report,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, exportName) => beginExportWithTemplate(templateName, templateType, transactionIDList, exportName),
        onDeleteSelected,
    });

    const {
        selectionModeReportLevelActions,
        allExpensesSelected,
        hasPayInSelectionMode,
        onSelectionModePaymentSelect,
        selectionModeKYCSuccess,
        shouldBlockAction,
        primaryAction,
        kycWallRef,
        isHoldMenuVisible,
        requestType,
        paymentType,
        selectedVBBAToPayFromHoldMenu,
        handleHoldMenuClose,
        handleHoldMenuConfirm,
        hasOnlyHeldExpenses,
        nonHeldAmount,
        fullAmount,
        hasValidNonHeldAmount,
    } = useSelectionModeReportActions({
        report,
        chatReport,
        policy,
        reportActions,
        reportNameValuePairs,
        reportMetadata,
        transactions: transactionsWithoutPendingDelete,
        selectedTransactionIDs,
    });

    const selectedTransactionsOptions = (() => {
        const mappedOptions = originalSelectedTransactionsOptions.map((option) => {
            if (option.value === CONST.REPORT.SECONDARY_ACTIONS.REJECT) {
                return {
                    ...option,
                    onSelected: () => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        if (dismissedRejectUseExplanation) {
                            option.onSelected?.();
                        } else {
                            setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK);
                        }
                    },
                };
            }
            return option;
        });

        if (allExpensesSelected && selectionModeReportLevelActions.length) {
            return [...selectionModeReportLevelActions, ...mappedOptions];
        }
        return mappedOptions;
    })();

    const popoverUseScrollView = shouldPopoverUseScrollView(selectedTransactionsOptions);

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK) {
            dismissRejectUseExplanation();
            if (report?.reportID) {
                Navigation.navigate(
                    ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.getRoute({
                        reportID: report.reportID,
                    }),
                );
            }
        }
        setRejectModalAction(null);
    };

    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);
    const isSelectAllChecked = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length;

    return (
        <>
            {exportDownloadStatusModal}
            {isDuplicateOptionVisible && (
                <BulkDuplicateHandler
                    selectedTransactionsKeys={selectedTransactionIDs}
                    allTransactions={allTransactionsForDuplicate}
                    allReports={allReportsForDuplicate}
                    searchData={undefined}
                    onHandlerReady={setDuplicateHandler}
                    onAfterDuplicate={() => clearSelectedTransactions(true)}
                />
            )}
            {shouldUseNarrowLayout && isMobileSelectionModeEnabled && (
                <OfflineWithFeedback pendingAction={reportPendingAction}>
                    <View
                        style={[isInLandscapeMode ? [styles.flexRowReverse, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap6, styles.pb3, styles.ph5] : styles.flexColumn]}
                    >
                        <ReportSubmitToPopoverAnchor reportID={reportID}>
                            <SelectionDropdown
                                hasPayInSelectionMode={hasPayInSelectionMode}
                                chatReport={chatReport}
                                report={report}
                                onSelectionModePaymentSelect={onSelectionModePaymentSelect}
                                selectionModeKYCSuccess={selectionModeKYCSuccess}
                                onWorkspacePolicySelect={(selectedPolicy, triggerKYCFlow) => {
                                    if (shouldBlockAction(undefined, true)) {
                                        return;
                                    }
                                    triggerKYCFlow({policy: selectedPolicy});
                                }}
                                primaryAction={primaryAction}
                                selectedTransactionsOptions={selectedTransactionsOptions}
                                selectedTransactionIDs={selectedTransactionIDs}
                                kycWallRef={kycWallRef}
                                shouldPopoverUseScrollView={popoverUseScrollView}
                            />
                        </ReportSubmitToPopoverAnchor>

                        <SelectAllCheckbox
                            isSelectAllChecked={isSelectAllChecked}
                            isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                            hasAnySelected={selectedTransactionIDs.length > 0}
                            onSelectAll={() => setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID))}
                            onClearAll={() => clearSelectedTransactions(true)}
                        />
                    </View>
                </OfflineWithFeedback>
            )}
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={handleHoldMenuClose}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    methodID={paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? selectedVBBAToPayFromHoldMenu : undefined}
                    chatReport={chatReport}
                    moneyRequestReport={report}
                    hasNonHeldExpenses={!hasOnlyHeldExpenses}
                    onConfirm={handleHoldMenuConfirm}
                    transactionCount={transactions.length}
                />
            )}
        </>
    );
}

function SelectionToolbarGate({reportID, transactions, reportActions}: SelectionToolbarProps) {
    const {selectedTransactionIDs, currentSelectedTransactionReportID} = useSearchSelectionContext();
    const {clearSelectedTransactions, setCurrentSelectedTransactionReportID} = useSearchSelectionActions();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useFocusEffect(() => {
        if (reportID && currentSelectedTransactionReportID !== reportID && selectedTransactionIDs.length > 0) {
            clearSelectedTransactions(true);
        }

        setCurrentSelectedTransactionReportID(reportID);
    });

    if (selectedTransactionIDs.length === 0 && !isMobileSelectionModeEnabled) {
        return null;
    }

    return (
        <SelectionToolbar
            reportID={reportID}
            transactions={transactions}
            reportActions={reportActions}
        />
    );
}

export default SelectionToolbarGate;
