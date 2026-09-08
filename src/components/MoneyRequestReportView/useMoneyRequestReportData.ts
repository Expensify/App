import useNetwork from '@hooks/useNetwork';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type UseMoneyRequestReportDataResult = {
    /** Paginated report actions filtered down to the ones the money-request report view works with, newest-first */
    reportActions: OnyxTypes.ReportAction[];

    /** The report's non-deleted transactions (including offline pending deletes) */
    reportTransactions: OnyxTypes.Transaction[];

    /** `reportTransactions` minus the ones pending deletion while online */
    transactions: OnyxTypes.Transaction[];

    /** Whether any of the report's transactions is pending deletion */
    hasPendingDeletionTransaction: boolean;

    /** IDs of `transactions` */
    reportTransactionIDs: string[];

    /** IDs of `reportActions` */
    reportActionIDs: string[];
};

/**
 * Derives the money-request report view's action/transaction working set from the paginated actions
 * and the report's transaction collection.
 *
 * This chain lives in its own hook (rather than inline in the component) so React Compiler can
 * memoize it: in the component body the derivations interleave with other hook calls, which puts the
 * intermediate arrays' mutable ranges across hook boundaries and makes the whole chain ineligible
 * for a reactive scope — every consumer downstream then cache-misses on identity every render.
 */
function useMoneyRequestReportData(reportIDFromRoute: string | undefined, unfilteredReportActions: OnyxTypes.ReportAction[]): UseMoneyRequestReportDataResult {
    const {isOffline} = useNetwork();
    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);

    // The spread copy is load-bearing: getFilteredReportActionsForReportView may return an alias of its
    // (frozen) argument, and the compiler must assume getAllNonDeletedTransactions can mutate `reportActions`.
    // Without the copy that reads as a mutation of frozen hook data and the compiler bails out of
    // memoizing the entire chain.
    const reportActions = [...getFilteredReportActionsForReportView(unfilteredReportActions)];
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const transactions = reportTransactions.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const hasPendingDeletionTransaction = Object.values(allReportTransactions ?? {}).some((transaction) => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = transactions.map((transaction) => transaction.transactionID);
    const reportActionIDs = reportActions.map((action) => action.reportActionID);

    return {
        reportActions,
        reportTransactions,
        transactions,
        hasPendingDeletionTransaction,
        reportTransactionIDs,
        reportActionIDs,
    };
}

export default useMoneyRequestReportData;
