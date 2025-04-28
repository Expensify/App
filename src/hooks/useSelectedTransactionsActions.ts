import {useMemo} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import {useMoneyRequestReportContext} from '@components/MoneyRequestReportView/MoneyRequestReportContext';
import {deleteMoneyRequest, unholdRequest} from '@libs/actions/IOU';
import {exportReportToCSV} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canDeleteCardTransactionByLiabilityType, canDeleteTransaction, isMoneyRequestReport as isMoneyRequestReportUtils} from '@libs/ReportUtils';
import {getTransaction, isOnHold} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OriginalMessageIOU, Report, ReportAction, Session} from '@src/types/onyx';
import useLocalize from './useLocalize';

// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ingored.
const HOLD = 'HOLD';
const UNHOLD = 'UNHOLD';

function useSelectedTransactionsActions({report, reportActions, session, onExportFailed}: {report?: Report; reportActions: ReportAction[]; session?: Session; onExportFailed?: () => void}) {
    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();
    const {translate} = useLocalize();

    return useMemo(() => {
        if (!selectedTransactionsID.length) {
            return [];
        }
        const options = [];
        const selectedTransactions = selectedTransactionsID.map((transactionID) => getTransaction(transactionID)).filter((t) => !!t);

        const anyTransactionOnHold = selectedTransactions.some(isOnHold);
        const allTransactionOnHold = selectedTransactions.every(isOnHold);
        const isReportReimbursed = report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
        const isMoneyRequestReport = isMoneyRequestReportUtils(report);

        if (isMoneyRequestReport && !anyTransactionOnHold && selectedTransactions.length === 1 && !isReportReimbursed) {
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

        if (isMoneyRequestReport && allTransactionOnHold && selectedTransactions.length === 1) {
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
                onSelected: () => {
                    const iouActions = reportActions.filter((action) => isMoneyRequestAction(action));

                    const transactionsWithActions = selectedTransactions.map((t) => ({
                        transactionID: t?.transactionID,
                        action: iouActions.find((action) => {
                            const IOUTransactionID = (getOriginalMessage(action) as OriginalMessageIOU)?.IOUTransactionID;

                            return t?.transactionID === IOUTransactionID;
                        }),
                    }));

                    transactionsWithActions.forEach(({transactionID, action}) => action && deleteMoneyRequest(transactionID, action));
                    setSelectedTransactionsID([]);
                },
            });
        }
        return options;
    }, [onExportFailed, report, reportActions, selectedTransactionsID, session?.accountID, setSelectedTransactionsID, translate]);
}

export default useSelectedTransactionsActions;
