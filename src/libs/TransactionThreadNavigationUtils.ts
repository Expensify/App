import type {Beta, IntroSelected, PersonalDetailsList, Report, ReportAction, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {createTransactionThreadReport, setOptimisticTransactionThread} from './actions/Report';
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
    personalDetails: OnyxEntry<PersonalDetailsList>;
    conciergeChat: OnyxEntry<Report>;
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
        conciergeChat: context.conciergeChat,
        currentUserLogin: context.currentUserEmail ?? '',
        currentUserAccountID: context.currentUserAccountID,
        betas: context.betas,
        iouReport: getReportOrDraftReport(reportID) ?? expense.report,
        iouReportAction: iouAction,
        transaction,
        personalDetails: context.personalDetails,
    });
    return transactionThreadReport?.reportID ?? reportID;
}

/**
 * Resolves the transaction thread report to navigate to for a given expense's IOU action: returns the existing
 * thread — optimistically materializing it in Onyx when the action references a thread that hasn't been fetched
 * yet — or creates a new thread when none exists. Shared by the duplicate-review action and the prev/next carousel.
 */
function getOrCreateTransactionThreadReportID(
    {
        threadReportID,
        threadReportExists,
        iouReport,
        iouReportAction,
        transaction,
    }: {
        /** The transaction thread report ID from the IOU action's childReportID, if any */
        threadReportID: string | undefined;

        /** Whether the thread report already exists in Onyx */
        threadReportExists: boolean;

        /** The expense's parent IOU report */
        iouReport: OnyxEntry<Report>;

        /** The expense's parent IOU report action */
        iouReportAction: OnyxEntry<ReportAction>;

        /** The expense transaction */
        transaction: OnyxEntry<Transaction>;
    },
    context: ResolveReportContext,
): string | undefined {
    // The thread already exists; it just may not have been fetched into Onyx yet, so set it optimistically.
    if (threadReportID) {
        if (!threadReportExists) {
            setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouReportAction?.reportActionID, iouReport?.policyID);
        }
        return threadReportID;
    }

    // No thread yet, so create it.
    const transactionThreadReport = createTransactionThreadReport({
        introSelected: context.introSelected,
        conciergeChat: context.conciergeChat,
        currentUserLogin: context.currentUserEmail ?? '',
        currentUserAccountID: context.currentUserAccountID,
        betas: context.betas,
        iouReport,
        iouReportAction,
        transaction,
        personalDetails: context.personalDetails,
    });
    return transactionThreadReport?.reportID;
}

export {getReportIDToOpenForExpense, getOrCreateTransactionThreadReportID};
export type {TransactionThreadNavigationDescriptor};
