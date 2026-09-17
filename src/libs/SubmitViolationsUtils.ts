import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getTransactionViolations, isBrokenConnectionViolation, isPendingRTERViolation, isSevenDayHoldViolation} from './TransactionUtils';

type SubmitViolationsSummary = {
    /** Whether any transaction has an unmatched RTER violation that has been pending for more than 7 days. */
    hasSevenDayHoldViolation: boolean;
    /**
     * Whether any transaction has an RTER violation that is still recently pending, i.e. not a broken connection and not a seven-day hold.
     * This predates #101213. The pre-existing "mark as cash" resolution for this case is preserved as-is.
     */
    hasGenericPendingRTERViolation: boolean;
    /** Whether any transaction has been rejected by an approver and not yet marked as resolved. */
    hasRejectedViolation: boolean;
    /** Whether the whole report was rejected back to the submitter (a separate mechanism from a rejected expense, with no transaction violation of its own). */
    hasReportBeenRejected: boolean;
    /** Every other non-dismissed violation of type VIOLATION with no known one-click resolution, deduped by name. */
    otherViolations: TransactionViolation[];
};

export type {SubmitViolationsSummary};

/**
 * Categorizes a report's non-dismissed transaction violations, plus the whole-report-rejected state, for the
 * pre-submit acknowledgement modal. Violations with a known one-click resolution (seven-day hold or generic pending
 * RTER resolve to "mark as cash", rejected expense resolves to "mark as resolved") are tracked as booleans so the
 * modal can offer that resolution. Everything else, including a whole-report rejection that has no resolution beyond
 * resubmitting, is collected for display only.
 */
function getSubmitViolationsSummary(
    transactions: Array<OnyxEntry<Transaction>>,
    allTransactionViolations: OnyxCollection<TransactionViolations>,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): SubmitViolationsSummary {
    let hasSevenDayHoldViolation = false;
    let hasGenericPendingRTERViolation = false;
    let hasRejectedViolation = false;
    const hasReportBeenRejected = report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.nextStep?.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT;
    const otherViolationsByName = new Map<string, TransactionViolation>();
    for (const transaction of transactions) {
        const filteredViolations = getTransactionViolations(transaction, allTransactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy) ?? [];
        for (const violation of filteredViolations) {
            if (isPendingRTERViolation(violation)) {
                if (isSevenDayHoldViolation(violation)) {
                    hasSevenDayHoldViolation = true;
                } else {
                    hasGenericPendingRTERViolation = true;
                }
                continue;
            }
            if (violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE) {
                hasRejectedViolation = true;
                continue;
            }
            if (violation.type !== CONST.VIOLATION_TYPES.VIOLATION) {
                continue;
            }
            if (violation.name === CONST.VIOLATIONS.HOLD) {
                continue;
            }
            if (isBrokenConnectionViolation(violation)) {
                continue;
            }
            if (!otherViolationsByName.has(violation.name)) {
                otherViolationsByName.set(violation.name, violation);
            }
        }
    }
    return {
        hasSevenDayHoldViolation,
        hasGenericPendingRTERViolation,
        hasRejectedViolation,
        hasReportBeenRejected,
        otherViolations: Array.from(otherViolationsByName.values()),
    };
}

/**
 * Whether a summary contains any of the #101213 submit-blocking violations that require the user to acknowledge
 * them via the pre-submit modal. A generic (non-seven-day) pending RTER violation predates #101213 and keeps its
 * own standalone "mark as cash?" prompt (see useConfirmViolationsAndProceed), so it is intentionally excluded here.
 */
function hasAnySubmitViolation(summary: SubmitViolationsSummary): boolean {
    return summary.hasSevenDayHoldViolation || summary.hasRejectedViolation || summary.hasReportBeenRejected || summary.otherViolations.length > 0;
}

/**
 * Check if a transaction has been rejected
 */
function hasTransactionBeenRejected(transactionViolations: OnyxEntry<TransactionViolations>): boolean {
    return !!transactionViolations && transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
}

export {getSubmitViolationsSummary, hasAnySubmitViolation, hasTransactionBeenRejected};
