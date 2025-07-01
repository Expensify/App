import {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import {useSearchContext} from '@components/Search/SearchContext';
import {deleteMoneyRequest, unholdRequest} from '@libs/actions/IOU';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {exportReportToCSV} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canHoldUnholdReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    isInvoiceReport,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OriginalMessageIOU, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useReportIsArchived from './useReportIsArchived';

// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ignored.
const HOLD = 'HOLD';
const UNHOLD = 'UNHOLD';
const MOVE = 'MOVE';

function useSelectedTransactionsActions({
    report,
    reportActions,
    allTransactionsLength,
    session,
    onExportFailed,
}: {
    report?: Report;
    reportActions: ReportAction[];
    allTransactionsLength: number;
    session?: Session;
    onExportFailed?: () => void;
}) {
    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const selectedTransactions = useMemo(
        () =>
            selectedTransactionIDs.reduce((acc, transactionID) => {
                const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                if (transaction) {
                    acc.push(transaction);
                }
                return acc;
            }, [] as Transaction[]),
        [allTransactions, selectedTransactionIDs],
    );

    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const isTrackExpenseThread = isTrackExpenseReport(report);
    const isInvoice = isInvoiceReport(report);
    let iouType: IOUType = CONST.IOU.TYPE.SUBMIT;

    if (isTrackExpenseThread) {
        iouType = CONST.IOU.TYPE.TRACK;
    }
    if (isInvoice) {
        iouType = CONST.IOU.TYPE.INVOICE;
    }

    const handleDeleteTransactions = useCallback(() => {
        const iouActions = reportActions.filter((action) => isMoneyRequestAction(action));

        const transactionsWithActions = selectedTransactionIDs.map((transactionID) => ({
            transactionID,
            action: iouActions.find((action) => {
                const IOUTransactionID = (getOriginalMessage(action) as OriginalMessageIOU)?.IOUTransactionID;
                return transactionID === IOUTransactionID;
            }),
        }));

        transactionsWithActions.forEach(({transactionID, action}) => action && deleteMoneyRequest(transactionID, action));
        clearSelectedTransactions(true);
        if (allTransactionsLength - transactionsWithActions.length <= 1) {
            turnOffMobileSelectionMode();
        }
        setIsDeleteModalVisible(false);
    }, [allTransactionsLength, reportActions, selectedTransactionIDs, clearSelectedTransactions]);

    const showDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const hideDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    const computedOptions = useMemo(() => {
        if (!selectedTransactionIDs.length) {
            return [];
        }
        const options = [];
        const isMoneyRequestReport = isMoneyRequestReportUtils(report);
        const isReportReimbursed = report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
        let canHoldTransactions = selectedTransactions.length > 0 && isMoneyRequestReport && !isReportReimbursed;
        let canUnholdTransactions = selectedTransactions.length > 0 && isMoneyRequestReport;

        selectedTransactions.forEach((selectedTransaction) => {
            if (!canHoldTransactions && !canUnholdTransactions) {
                return;
            }

            if (!selectedTransaction?.transactionID) {
                canHoldTransactions = false;
                canUnholdTransactions = false;
                return;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, selectedTransaction.transactionID);
            const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(iouReportAction);

            canHoldTransactions = canHoldTransactions && canHoldRequest;
            canUnholdTransactions = canUnholdTransactions && canUnholdRequest;
        });

        if (canHoldTransactions) {
            options.push({
                text: translate('iou.hold'),
                icon: Expensicons.Stopwatch,
                value: HOLD,
                onSelected: () => {
                    if (!report?.reportID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.getRoute({reportID: report.reportID}));
                },
            });
        }

        if (canUnholdTransactions) {
            options.push({
                text: translate('iou.unhold'),
                icon: Expensicons.Stopwatch,
                value: UNHOLD,
                onSelected: () => {
                    selectedTransactionIDs.forEach((transactionID) => {
                        const action = getIOUActionForTransactionID(reportActions, transactionID);
                        if (!action?.childReportID) {
                            return;
                        }
                        unholdRequest(transactionID, action?.childReportID);
                    });
                    clearSelectedTransactions(true);
                },
            });
        }

        options.push({
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            text: translate('common.downloadAsCSV'),
            icon: Expensicons.Download,
            onSelected: () => {
                if (!report) {
                    return;
                }
                exportReportToCSV({reportID: report.reportID, transactionIDList: selectedTransactionIDs}, () => {
                    onExportFailed?.();
                });
                clearSelectedTransactions(true);
            },
        });

        const canSelectedExpensesBeMoved = selectedTransactions.every((transaction) => {
            if (!transaction) {
                return false;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, transaction.transactionID);

            const canMoveExpense = canEditFieldOfMoneyRequest(iouReportAction, CONST.EDIT_REQUEST_FIELD.REPORT);
            return canMoveExpense;
        });

        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
        if (canSelectedExpensesBeMoved && canUserPerformWriteAction) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionIDs.length}),
                icon: Expensicons.DocumentMerge,
                value: MOVE,
                onSelected: () => {
                    const route = ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, report?.reportID);
                    Navigation.navigate(route);
                },
            });
        }

        const canAllSelectedTransactionsBeRemoved = selectedTransactionIDs.every((transactionID) => {
            const canRemoveTransaction = canDeleteCardTransactionByLiabilityType(transactionID);
            const action = getIOUActionForTransactionID(reportActions, transactionID);
            const isActionDeleted = isDeletedAction(action);
            const isIOUActionOwner = typeof action?.actorAccountID === 'number' && typeof session?.accountID === 'number' && action.actorAccountID === session?.accountID;

            return canRemoveTransaction && isIOUActionOwner && !isActionDeleted;
        });

        const canRemoveReportTransaction = canDeleteTransaction(report, isReportArchived);

        if (canRemoveReportTransaction && canAllSelectedTransactionsBeRemoved) {
            options.push({
                text: translate('common.delete'),
                icon: Expensicons.Trashcan,
                value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: showDeleteModal,
            });
        }
        return options;
    }, [
        selectedTransactionIDs,
        report,
        selectedTransactions,
        translate,
        reportActions,
        clearSelectedTransactions,
        onExportFailed,
        iouType,
        session?.accountID,
        showDeleteModal,
        isReportArchived,
    ]);

    return {
        options: computedOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        showDeleteModal,
        hideDeleteModal,
    };
}

export default useSelectedTransactionsActions;
