import {useCallback, useMemo, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import {useMoneyRequestReportContext} from '@components/MoneyRequestReportView/MoneyRequestReportContext';
import {deleteMoneyRequest, unholdRequest} from '@libs/actions/IOU';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {exportReportToCSV} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canDeleteCardTransactionByLiabilityType, canDeleteTransaction, canHoldUnholdReportAction, isMoneyRequestReport as isMoneyRequestReportUtils} from '@libs/ReportUtils';
import {getTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OriginalMessageIOU, Report, ReportAction, Session} from '@src/types/onyx';
import useLocalize from './useLocalize';

// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ingored.
const HOLD = 'HOLD';
const UNHOLD = 'UNHOLD';

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
    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const handleDeleteTransactions = useCallback(() => {
        const iouActions = reportActions.filter((action) => isMoneyRequestAction(action));

        const transactionsWithActions = selectedTransactionsID.map((transactionID) => ({
            transactionID,
            action: iouActions.find((action) => {
                const IOUTransactionID = (getOriginalMessage(action) as OriginalMessageIOU)?.IOUTransactionID;
                return transactionID === IOUTransactionID;
            }),
        }));

        transactionsWithActions.forEach(({transactionID, action}) => action && deleteMoneyRequest(transactionID, action));
        setSelectedTransactionsID([]);
        if (allTransactionsLength - transactionsWithActions.length <= 1) {
            turnOffMobileSelectionMode();
        }
        setIsDeleteModalVisible(false);
    }, [allTransactionsLength, reportActions, selectedTransactionsID, setSelectedTransactionsID]);

    const showDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const hideDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    const computedOptions = useMemo(() => {
        if (!selectedTransactionsID.length) {
            return [];
        }
        const options = [];
        const isMoneyRequestReport = isMoneyRequestReportUtils(report);
        const selectedTransactions = selectedTransactionsID.map((transactionID) => getTransaction(transactionID)).filter((t) => !!t);
        const isReportReimbursed = report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
        let canHoldTransactions = selectedTransactions.length > 0 && isMoneyRequestReport && !isReportReimbursed;
        let canUnholdTransactions = selectedTransactions.length > 0 && isMoneyRequestReport;

        selectedTransactions.forEach((selectedTransaction) => {
            if (!canHoldTransactions && !canHoldTransactions) {
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
                    selectedTransactionsID.forEach((transactionID) => {
                        const action = getIOUActionForTransactionID(reportActions, transactionID);
                        if (!action?.childReportID) {
                            return;
                        }
                        unholdRequest(transactionID, action?.childReportID);
                    });
                    setSelectedTransactionsID([]);
                },
            });
        }

        options.push({
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD,
            text: translate('common.download'),
            icon: Expensicons.Download,
            onSelected: () => {
                if (!report) {
                    return;
                }
                exportReportToCSV({reportID: report.reportID, transactionIDList: selectedTransactionsID}, () => {
                    onExportFailed?.();
                });
                setSelectedTransactionsID([]);
            },
        });

        const canAllSelectedTransactionsBeRemoved = selectedTransactionsID.every((transactionID) => {
            const canRemoveTransaction = canDeleteCardTransactionByLiabilityType(transactionID);
            const action = getIOUActionForTransactionID(reportActions, transactionID);
            const isActionDeleted = isDeletedAction(action);
            const isIOUActionOwner = typeof action?.actorAccountID === 'number' && typeof session?.accountID === 'number' && action.actorAccountID === session?.accountID;

            return canRemoveTransaction && isIOUActionOwner && !isActionDeleted;
        });

        const canRemoveReportTransaction = canDeleteTransaction(report);

        if (canRemoveReportTransaction && canAllSelectedTransactionsBeRemoved) {
            options.push({
                text: translate('common.delete'),
                icon: Expensicons.Trashcan,
                value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: showDeleteModal,
            });
        }
        return options;
    }, [onExportFailed, report, reportActions, selectedTransactionsID, session?.accountID, setSelectedTransactionsID, translate, showDeleteModal]);

    return {
        options: computedOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        showDeleteModal,
        hideDeleteModal,
    };
}

export default useSelectedTransactionsActions;
