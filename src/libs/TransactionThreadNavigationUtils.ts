import type {OnyxEntry} from 'react-native-onyx';
import type {Beta, IntroSelected, Transaction} from '@src/types/onyx';
import {createTransactionThreadReport} from './actions/Report';
import {getIOUActionForReportID} from './ReportActionsUtils';
import {getReportOrDraftReport, isOneTransactionReport} from './ReportUtils';
import {isExpenseUnreported} from './TransactionUtils';

/**
 * Minimal, side-effect-free description of a sibling expense. It carries just enough snapshot-derived data for
 * the prev/next carousel to resolve (and, if needed, create) the report to open lazily — only for the sibling
 * the user actually navigates to, rather than eagerly resolving every sibling up front.
 */
type TransactionThreadNavigationDescriptor = {
    /** The expense's parent report ID */
    reportID: string;

    /** The transaction thread report resolved from the snapshot's IOU action, when already known */
    threadReportID?: string;

    /** The full transaction */
    transaction: Transaction;
};

/** Context needed to create a transaction thread on demand when one doesn't exist yet. */
type ResolveReportContext = {
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    currentUserEmail: string | undefined;
    currentUserAccountID: number;
};

/**
 * Resolves which report to open for a single expense, creating its transaction thread only if necessary.
 *
 * A one-transaction report already renders the expense inline, so we keep its reportID; for a multi-expense
 * report we resolve (and create if needed) the transaction thread for that expense. This is intentionally lazy:
 * callers resolve one expense at a time, so opening a list never creates threads for expenses the user hasn't
 * navigated to.
 */
function getReportIDToOpenForExpense(expense: TransactionThreadNavigationDescriptor, context: ResolveReportContext): string {
    const {transaction, reportID, threadReportID} = expense;
    const isUnreported = isExpenseUnreported(transaction);

    // Unreported (tracked) expenses live in the self-DM; their transaction thread (resolved from the
    // snapshot) is the expense view to open, since report "0" does not exist.
    if (isUnreported) {
        return threadReportID ?? reportID;
    }

    const parentReport = getReportOrDraftReport(reportID);
    if (isOneTransactionReport(parentReport)) {
        // Prefer the transaction thread (resolved from the snapshot) so the expense opens in the transaction-thread
        // view (MoneyRequestHeader), which hosts the prev/next carousel. Falling back to the parent one-transaction
        // report would render MoneyReportHeader, which has no carousel. Only use the parent when no thread is known.
        return threadReportID ?? reportID;
    }

    // Prefer the transaction thread resolved from the Search snapshot. The main reportActions_ collection
    // may be empty (e.g. right after clearing Onyx) so getIOUActionForReportID can fail and incorrectly
    // fall back to the whole parent expense report; the snapshot already carries the correct childReportID.
    if (threadReportID) {
        return threadReportID;
    }

    const iouAction = getIOUActionForReportID(reportID, transaction.transactionID);
    if (!iouAction) {
        return reportID;
    }
    if (iouAction.childReportID) {
        return iouAction.childReportID;
    }

    const transactionThreadReport = createTransactionThreadReport({
        introSelected: context.introSelected,
        currentUserLogin: context.currentUserEmail ?? '',
        currentUserAccountID: context.currentUserAccountID,
        betas: context.betas,
        iouReport: parentReport,
        iouReportAction: iouAction,
        transaction,
    });
    return transactionThreadReport?.reportID ?? reportID;
}

export {getReportIDToOpenForExpense};
export type {TransactionThreadNavigationDescriptor};
