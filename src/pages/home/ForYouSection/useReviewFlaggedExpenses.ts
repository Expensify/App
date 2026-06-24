import {useIsFocused} from '@react-navigation/core';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getVisibleTransactionViolations} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, Session, Transaction} from '@src/types/onyx';
import type TransactionViolations from '@src/types/onyx/TransactionViolation';

type ReviewFlaggedExpenses = {
    /** Number of flagged expenses awaiting review, used to decide whether to render the review row */
    count: number;

    /** Opens the first flagged expense's transaction thread with the full set of flagged expenses as the review carousel */
    reviewExpenses: () => void;
};

/** A transaction that should surface in the "Review X expenses" row, paired with its parent report. */
type FlaggedExpense = {
    /** ID of the flagged transaction */
    transactionID: string;
    /** ID of the parent expense report */
    reportID: string;
};

/** Stable empty reference returned before the first focused scan, so the row never depends on a fresh `[]`. */
const EMPTY_FLAGGED_EXPENSES: FlaggedExpense[] = [];

/**
 * Returns true when this report is an OPEN/OPEN expense report owned by the current user.
 *
 * `currentUserAccountID` is required. Callers should pass `session?.accountID ?? CONST.DEFAULT_NUMBER_ID`
 * so that the ownership check fails closed when the session is not yet populated (no real ownerAccountID is 0).
 */
function isCurrentUserOpenExpenseReport(report: Report | null | undefined, currentUserAccountID: number): boolean {
    if (!report) {
        return false;
    }
    if (report.type !== CONST.REPORT.TYPE.EXPENSE) {
        return false;
    }
    if (report.ownerAccountID !== currentUserAccountID) {
        return false;
    }
    return report.stateNum === CONST.REPORT.STATE_NUM.OPEN && report.statusNum === CONST.REPORT.STATUS_NUM.OPEN;
}

/** Returns true when at least one visible violation should surface in the "Review X expenses" row. */
function hasReviewableViolation(violations: TransactionViolations | null | undefined): boolean {
    if (!violations || violations.length === 0) {
        return false;
    }

    return violations.some((violation) => {
        if (!violation) {
            return false;
        }
        if (violation.showInReview === false) {
            return false;
        }
        if (violation.name === CONST.REPORT_VIOLATIONS.FIELD_REQUIRED) {
            return false;
        }
        if (violation.type === CONST.VIOLATION_TYPES.NOTICE || violation.type === CONST.VIOLATION_TYPES.WARNING) {
            return violation.showInReview === true;
        }
        return true;
    });
}

/** Scans the current user's OPEN expense reports for transactions that have at least one reviewable violation. */
function getFlaggedExpenses(
    allReports: OnyxCollection<Report>,
    allTransactions: OnyxCollection<Transaction>,
    allTransactionViolations: OnyxCollection<TransactionViolations>,
    allPolicies: OnyxCollection<Policy>,
    session: OnyxEntry<Session>,
): FlaggedExpense[] {
    if (!allReports || !allTransactions) {
        return [];
    }

    const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const currentUserEmail = session?.email ?? '';
    const flaggedExpenses: FlaggedExpense[] = [];

    for (const transactionKey of Object.keys(allTransactions)) {
        const transaction = allTransactions[transactionKey];
        if (!transaction?.transactionID || !transaction.reportID) {
            continue;
        }

        const report = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        if (!isCurrentUserOpenExpenseReport(report, currentUserAccountID)) {
            continue;
        }

        const violations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
        if (!violations || violations.length === 0) {
            continue;
        }

        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        const visibleViolations = getVisibleTransactionViolations(transaction, violations, currentUserEmail, currentUserAccountID, report, policy);
        if (!hasReviewableViolation(visibleViolations)) {
            continue;
        }

        flaggedExpenses.push({transactionID: transaction.transactionID, reportID: transaction.reportID});
    }

    return flaggedExpenses;
}

/**
 * Encapsulates the data plumbing for the "Review X expenses" row in the For You section: it scans the current
 * user's OPEN expense reports for flagged transactions, then reads the first flagged expense's report, report
 * actions, and transaction, and exposes a bound handler that navigates to the transaction thread
 * (single-expense RHP + review carousel).
 */
function useReviewFlaggedExpenses(): ReviewFlaggedExpenses {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isFocused = useIsFocused();

    // Skip the O(n) flagged-expense scan while Home is blurred. usePreviousDefined keeps the
    // last computed result so the row never flashes empty when Home is re-focused, and the count refreshes
    // live on re-focus
    const freshFlaggedExpenses = isFocused ? getFlaggedExpenses(allReports, allTransactions, allTransactionViolations, allPolicies, session) : undefined;
    const flaggedExpenses = usePreviousDefined(freshFlaggedExpenses) ?? EMPTY_FLAGGED_EXPENSES;

    const firstFlaggedExpense = flaggedExpenses.at(0);
    const firstReportID = firstFlaggedExpense?.reportID;
    const firstTransactionID = firstFlaggedExpense?.transactionID;

    // Load the first flagged expense's parent report, its actions, and the transaction itself so the shared
    // navigation hook can resolve (or optimistically create) the transaction thread.
    const [firstFlaggedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(firstReportID)}`);

    const navigateToTransactionThread = useNavigateToTransactionThread();

    const reviewExpenses = () => {
        if (!firstTransactionID || !firstReportID) {
            return;
        }
        const firstFlaggedReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${firstReportID}`];
        const firstFlaggedTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransactionID}`];
        navigateToTransactionThread({
            transactionID: firstTransactionID,
            reportActions: Object.values(firstFlaggedReportActions ?? {}),
            report: firstFlaggedReport,
            transaction: firstFlaggedTransaction,
            siblingTransactionIDs: flaggedExpenses.map((flaggedExpense) => flaggedExpense.transactionID),
            backTo: ROUTES.HOME,
        });
    };

    return {count: flaggedExpenses.length, reviewExpenses};
}

export default useReviewFlaggedExpenses;
export {getFlaggedExpenses};
