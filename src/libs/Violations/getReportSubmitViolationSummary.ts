import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {hasPendingRTERViolation, hasTransactionBeenRejected, isBrokenConnectionViolation} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import ViolationsUtils from './ViolationsUtils';

type ReportSubmitViolationSummary = {
    /** A transaction on the report has its own AUTO_REPORTED_REJECTED_EXPENSE violation */
    hasRejectedExpense: boolean;
    /** The whole report was rejected to the submitter (report-level nextStep, no per-transaction violation to resolve) */
    hasReportBeenRejected: boolean;
    hasPendingCardMatch: boolean;
    /** First-seen violation instance per violation name, so the full message (with amounts/thresholds) can be built later */
    otherViolations: Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>;
};

/**
 * A whole-report rejection doesn't add a violation to the report's transactions - it's a report-level
 * state (nextStep, set when the last action is REJECTED_TO_SUBMITTER) rather than a TransactionViolations entry.
 */
function hasReportBeenRejectedToSubmitter(report: OnyxEntry<Report>): boolean {
    return report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.nextStep?.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT;
}

/**
 * Classifies a report's transaction violations into the three buckets shown by the "Submit report?"
 * confirmation modal: a rejected expense, a pending RTER/card-match, or everything else (informational only).
 */
function getReportSubmitViolationSummary(
    transactions: Array<OnyxEntry<Transaction>>,
    violationsCollection: OnyxCollection<TransactionViolations>,
    report: OnyxEntry<Report>,
): ReportSubmitViolationSummary {
    let hasRejectedExpense = false;
    let hasPendingCardMatch = false;
    const otherViolations = new Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>();

    for (const transaction of transactions) {
        if (!transaction?.transactionID) {
            continue;
        }
        const transactionViolations = violationsCollection?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
        if (!transactionViolations) {
            continue;
        }
        if (hasTransactionBeenRejected(transactionViolations)) {
            hasRejectedExpense = true;
        }
        if (hasPendingRTERViolation(transactionViolations)) {
            hasPendingCardMatch = true;
        }
        for (const violation of transactionViolations) {
            if (violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE) {
                continue;
            }

            if (violation.name === CONST.VIOLATIONS.RTER && violation.data?.pendingPattern && !isBrokenConnectionViolation(violation)) {
                continue;
            }
            if (!otherViolations.has(violation.name)) {
                otherViolations.set(violation.name, violation);
            }
        }
    }

    return {hasRejectedExpense, hasReportBeenRejected: hasReportBeenRejectedToSubmitter(report), hasPendingCardMatch, otherViolations};
}

type BuildSubmitViolationBulletsParams = {
    summary: ReportSubmitViolationSummary;
    translate: LocaleContextProps['translate'];
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/**
 * Builds the modal's bullet copy, in a fixed order: other violations first, then report/expense rejection, then
 * pending card match. Other violations use the same full message (with amounts/thresholds) shown elsewhere in the
 * app (e.g. the RBR message under an expense row), via ViolationsUtils.getViolationTranslation, rather than the
 * short label - so e.g. a receipt-required violation says "Receipt required over $25.00" instead of just "Expense
 * receipt required".
 */
function buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString}: BuildSubmitViolationBulletsParams): string[] {
    const bullets: string[] = [];

    for (const violation of summary.otherViolations.values()) {
        bullets.push(ViolationsUtils.getViolationTranslation({violation, translate, dateFnsLocale, convertToDisplayString}));
    }
    if (summary.hasReportBeenRejected) {
        bullets.push(translate('iou.confirmSubmitReportViolations.reportRejected'));
    }
    if (summary.hasRejectedExpense) {
        bullets.push(translate('iou.confirmSubmitReportViolations.rejectedExpense'));
    }
    if (summary.hasPendingCardMatch) {
        bullets.push(translate('iou.confirmSubmitReportViolations.pendingCardMatch'));
    }

    return bullets;
}

export {getReportSubmitViolationSummary, buildSubmitViolationBullets, hasReportBeenRejectedToSubmitter};
