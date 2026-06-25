import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useReportTransactionsCollection from './useReportTransactionsCollection';

/**
 * Derives the single-transaction thread report IDs and filtered actions for a money request report.
 */
function useTransactionThreadReportID(reportID: string | undefined) {
    const {isOffline} = useNetwork();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const isSentMoneyReport = reportActions.some((action) => isSentMoneyReportAction(action));
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    return {
        transactionThreadReportID,
        effectiveTransactionThreadReportID,
        reportActions,
    };
}

export default useTransactionThreadReportID;
