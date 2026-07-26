import type {Beta, IntroSelected, Report, ReportAction, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {createTransactionThreadReport} from './actions/Report';
import {getIOUActionForReportID} from './ReportActionsUtils';
import {findSelfDMReportID, getReportOrDraftReport} from './ReportUtils';
import {isExpenseUnreported} from './TransactionUtils';

/**
 * Minimal, side-effect-free description of a sibling expense. It carries just enough snapshot-derived data for
 * the prev/next carousel to resolve (and, if needed, create) the report to open lazily — only for the sibling
 * the user actually navigates to, rather than eagerly resolving every sibling up front.
 */
type TransactionThreadNavigationDescriptor = {
    /** The expense's parent report ID */
    reportID: string;

    /** The full transaction */
    transaction: Transaction;

    /** The expense's parent IOU report action, from the Search snapshot */
    reportAction?: ReportAction;

    /** The expense's parent report, from the Search snapshot */
    report?: Report;
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
 * This is intentionally lazy: callers resolve one expense at a time, so opening a list never creates threads
 * for expenses the user hasn't navigated to.
 */
function getReportIDToOpenForExpense(expense: TransactionThreadNavigationDescriptor, context: ResolveReportContext): string {
    const {transaction, reportID} = expense;
    const isUnreported = isExpenseUnreported(transaction);

    // Unreported (tracked) expenses live in the self-DM; their transaction thread is the expense view to open,
    // since report "0" does not exist. Prefer the snapshot-resolved thread, but fall back to local report actions
    // so an optimistic (offline) expense — absent from the snapshot — still resolves to its real thread.
    if (isUnreported) {
        return expense.reportAction?.childReportID ?? getIOUActionForReportID(findSelfDMReportID(), transaction.transactionID)?.childReportID ?? reportID;
    }

    // Prefer the transaction thread resolved from the Search snapshot. The main reportActions_ collection
    // may be empty (e.g. right after clearing Onyx) so getIOUActionForReportID can fail and incorrectly
    // fall back to the whole parent expense report; the snapshot already carries the correct childReportID.
    if (expense.reportAction?.childReportID) {
        return expense.reportAction.childReportID;
    }

    // Prefer the live action from the main collection (it may carry a newer childReportID), fall back to the
    // snapshot action carried on the descriptor so a snapshot-only expense can still resolve/create its thread.
    const iouAction = getIOUActionForReportID(reportID, transaction.transactionID) ?? expense.reportAction;
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
        iouReport: getReportOrDraftReport(reportID) ?? expense.report,
        iouReportAction: iouAction,
        transaction,
    });
    return transactionThreadReport?.reportID ?? reportID;
}

export {getReportIDToOpenForExpense};
export type {TransactionThreadNavigationDescriptor};
