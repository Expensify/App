import {useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useOnyx from '@hooks/useOnyx';
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
 * Powers the "Review X expenses" row: scans the current user's OPEN expense reports for flagged transactions
 * and exposes a handler that opens the first one's transaction thread (single-expense RHP + review carousel).
 *
 * `isHomeTabFocused` gates the O(n) scan — while the Home tab is blurred it is skipped and the row keeps its
 * last count. The Onyx subscriptions stay live (they cannot be paused) but only trigger a cheap re-render.
 */
function useReviewFlaggedExpenses(isHomeTabFocused: boolean): ReviewFlaggedExpenses {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const flaggedExpenses = isHomeTabFocused ? getFlaggedExpenses(allReports, allTransactions, allTransactionViolations, allPolicies, session) : undefined;

    // Retain the count across blur via "adjust state during render". It's a primitive, so this guard can't loop
    // and doesn't depend on the scan being referentially stable.
    const [count, setCount] = useState(0);
    if (flaggedExpenses && flaggedExpenses.length !== count) {
        setCount(flaggedExpenses.length);
    }

    // First flagged expense's report actions, for the navigation hook. Resolved only while focused.
    const firstReportID = flaggedExpenses?.at(0)?.reportID;
    const [firstFlaggedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(firstReportID)}`);

    const navigateToTransactionThread = useNavigateToTransactionThread();

    const reviewExpenses = () => {
        // The row is only pressable while focused, so the live scan result is available here.
        const firstFlaggedExpense = flaggedExpenses?.at(0);
        if (!flaggedExpenses || !firstFlaggedExpense) {
            return;
        }
        const firstFlaggedReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${firstFlaggedExpense.reportID}`];
        const firstFlaggedTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstFlaggedExpense.transactionID}`];
        navigateToTransactionThread({
            transactionID: firstFlaggedExpense.transactionID,
            reportActions: Object.values(firstFlaggedReportActions ?? {}),
            report: firstFlaggedReport,
            transaction: firstFlaggedTransaction,
            siblingTransactionIDs: flaggedExpenses.map((flaggedExpense) => flaggedExpense.transactionID),
            backTo: ROUTES.HOME,
        });
    };

    return {count, reviewExpenses};
}

export default useReviewFlaggedExpenses;
export {getFlaggedExpenses};
export type {ReviewFlaggedExpenses};
