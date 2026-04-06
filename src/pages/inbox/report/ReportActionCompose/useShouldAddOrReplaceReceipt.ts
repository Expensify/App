import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, canUserPerformWriteAction as canUserPerformWriteActionReportUtils, isReportTransactionThread} from '@libs/ReportUtils';
import {getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

/**
 * Determines whether the current report context allows adding or replacing a receipt,
 * and resolves the relevant transactionID.
 *
 * Used by ComposerProvider (for upload validation) and ComposerDropZone (for drop zone layout).
 */
function useShouldAddOrReplaceReceipt(reportID: string, isOffline: boolean) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});

    const isTransactionThreadView = isReportTransactionThread(report);

    // We need the filtered actions to count visible transactions
    const filteredReportActions = getFilteredReportActionsForReportView(rawReportActions ? Object.values(rawReportActions) : []);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const iouAction = rawReportActions ? (Object.values(rawReportActions).find((action) => isMoneyRequestAction(action)) as ReportAction | undefined) : undefined;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;
    const transactionID = getTransactionID(report) ?? linkedTransactionID;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const isSingleTransactionView = !!transaction && !!reportTransactions && reportTransactions.length === 1;
    const effectiveParentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt =
        canUserPerformWriteAction &&
        canEditFieldOfMoneyRequest({reportAction: effectiveParentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction}) &&
        !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;

    return {shouldAddOrReplaceReceipt, transactionID};
}

export default useShouldAddOrReplaceReceipt;
