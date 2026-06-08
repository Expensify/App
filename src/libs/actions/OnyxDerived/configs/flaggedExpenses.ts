import {getVisibleTransactionViolations} from '@libs/TransactionUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FlaggedExpensesDerivedValue} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type TransactionViolations from '@src/types/onyx/TransactionViolation';

type FlaggedExpenseEntry = FlaggedExpensesDerivedValue['flaggedExpenses'][number];

const EMPTY_VALUE: FlaggedExpensesDerivedValue = {flaggedExpenses: []};

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

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.FLAGGED_EXPENSES,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.POLICY, ONYXKEYS.SESSION],
    compute: ([allReports, allTransactions, allTransactionViolations, allPolicies, session]) => {
        if (!allReports || !allTransactions) {
            return EMPTY_VALUE;
        }

        const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const currentUserEmail = session?.email ?? '';
        const flaggedExpenses: FlaggedExpenseEntry[] = [];

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

        return {flaggedExpenses};
    },
});
