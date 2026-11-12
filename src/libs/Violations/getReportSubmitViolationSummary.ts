import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import Parser from '@libs/Parser';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {hasReportBeenRejectedToSubmitter, isExpenseReport} from '@libs/ReportUtils';
import {
    hasMissingSmartscanFieldsForRBR,
    hasPendingRTERViolation,
    hasTransactionBeenRejected,
    isFailedScanAmountPlaceholder,
    isMerchantMissing,
    isOnHold,
    isPendingRTERViolation,
    shouldShowViolation,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import ViolationsUtils, {filterReceiptViolations} from './ViolationsUtils';

type ReportSubmitViolationSummary = {
    /** A transaction on the report has its own AUTO_REPORTED_REJECTED_EXPENSE violation */
    hasRejectedExpense: boolean;
    /** The whole report was rejected to the submitter (report-level nextStep, no per-transaction violation to resolve) */
    hasReportBeenRejected: boolean;
    hasPendingCardMatch: boolean;
    /** An expense on the report has no merchant. The server never sends a violation for this, so it comes from the expense's own fields. */
    hasMissingMerchant: boolean;
    /** An expense on the report still has a failed scan's placeholder amount. Like a missing merchant, this comes from the expense's own fields. */
    hasMissingAmount: boolean;
    /** First-seen violation instance per violation name, so the full message (with amounts/thresholds) can be built later */
    otherViolations: Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>;
};

/** Whether the "Submit report?" modal should warn about the required fields this expense has left empty. */
function shouldWarnAboutMissingFields(transaction: Transaction, transactionViolations: OnyxEntry<TransactionViolations>, report: OnyxEntry<Report>, policy: OnyxEntry<Policy>): boolean {
    // These warnings are only for expense reports, where the merchant is required.
    if (!isExpenseReport(report)) {
        return false;
    }

    // Submitting moves a held expense to a new draft report, except on a dynamic external workflow, so it isn't part of this submission.
    if (isOnHold(transaction) && !hasDynamicExternalWorkflow(policy)) {
        return false;
    }

    // The smartscanFailed bullet already tells the submitter to enter this expense's missing details.
    if (transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED)) {
        return false;
    }

    // Distance expenses, receipts still being scanned and expenses being deleted can have placeholder values that aren't errors.
    return hasMissingSmartscanFieldsForRBR(transaction, report);
}

/**
 * Classifies what the "Submit report?" confirmation modal shows for a report: a rejected expense, a whole-report
 * rejection, a pending RTER/card-match, a missing merchant or amount, or any other violation (informational only).
 */
function getReportSubmitViolationSummary(
    transactions: Array<OnyxEntry<Transaction>>,
    violationsCollection: OnyxCollection<TransactionViolations>,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    currentUserEmail: string,
    currentUserAccountID: number,
): ReportSubmitViolationSummary {
    let hasRejectedExpense = false;
    let hasPendingCardMatch = false;
    let hasMissingMerchant = false;
    let hasMissingAmount = false;
    const otherViolations = new Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>();

    for (const transaction of transactions) {
        if (!transaction?.transactionID) {
            continue;
        }
        const transactionViolations = violationsCollection?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];

        // These fields have no violation, so this has to run before the check below skips expenses without violations.
        if (shouldWarnAboutMissingFields(transaction, transactionViolations, report, policy)) {
            hasMissingMerchant ||= isMerchantMissing(transaction);
            // Expense reports allow a zero amount, so only a failed scan's placeholder counts as a missing amount.
            hasMissingAmount ||= isFailedScanAmountPlaceholder(transaction);
        }

        if (!transactionViolations) {
            continue;
        }
        if (hasTransactionBeenRejected(transactionViolations)) {
            hasRejectedExpense = true;
        }
        if (hasPendingRTERViolation(transactionViolations)) {
            hasPendingCardMatch = true;
        }
        for (const violation of filterReceiptViolations(transactionViolations)) {
            if (violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE) {
                continue;
            }

            if (violation.name === CONST.VIOLATIONS.HOLD) {
                continue;
            }

            if (isPendingRTERViolation(violation)) {
                continue;
            }

            if (!shouldShowViolation(report, policy, violation.name, currentUserEmail, currentUserAccountID, true, transaction)) {
                continue;
            }

            if (!otherViolations.has(violation.name)) {
                otherViolations.set(violation.name, violation);
            }
        }
    }

    return {hasRejectedExpense, hasReportBeenRejected: hasReportBeenRejectedToSubmitter(report), hasPendingCardMatch, hasMissingMerchant, hasMissingAmount, otherViolations};
}

type BuildSubmitViolationBulletsParams = {
    summary: ReportSubmitViolationSummary;
    translate: LocaleContextProps['translate'];
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/**
 * Builds the modal's bullet copy, in a fixed order: other violations first, then a missing merchant and amount, then report/expense rejection, then
 * pending card match. Other violations use the same full message (with amounts/thresholds) shown elsewhere in the
 * app (e.g. the RBR message under an expense row), via ViolationsUtils.getViolationTranslation, rather than the
 * short label - so e.g. a receipt-required violation says "Receipt required over $25.00" instead of just "Expense
 * receipt required".
 */
function buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString}: BuildSubmitViolationBulletsParams): string[] {
    const bullets: string[] = [];

    for (const violation of summary.otherViolations.values()) {
        // The translation can include an HTML link (e.g. a broken-connection RTER message), which this modal has no
        // renderer for and which this call site doesn't have the data to build anyway (company-card page URL, broken
        // personal-card reconnect link); stripped to plain text here so an admin never sees a raw `<a href="...">`.
        bullets.push(Parser.htmlToText(ViolationsUtils.getViolationTranslation({violation, translate, dateFnsLocale, convertToDisplayString})));
    }
    if (summary.hasMissingMerchant) {
        bullets.push(translate('iou.missingMerchant'));
    }
    if (summary.hasMissingAmount) {
        bullets.push(translate('iou.missingAmount'));
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

/** Whether the summary has anything for the "Submit report?" modal to show. */
function hasAnySubmitViolation(summary: ReportSubmitViolationSummary): boolean {
    return (
        summary.hasRejectedExpense ||
        summary.hasReportBeenRejected ||
        summary.hasPendingCardMatch ||
        summary.hasMissingMerchant ||
        summary.hasMissingAmount ||
        summary.otherViolations.size > 0
    );
}

/**
 * The shouldResolveAcknowledgedViolations flag to submit with, once the user has confirmed the modal. Only the
 * rejected-expense violation is resolved this way - acknowledging the modal is enough to confirm the submitter
 * saw the rejection. Every other violation (including a pending card match) must stay on the expense for the
 * approver to review, so Submit anyway never resolves those.
 */
function shouldResolveAcknowledgedViolations(summary: ReportSubmitViolationSummary): boolean {
    return summary.hasRejectedExpense;
}

/**
 * Combines the per-report summaries of a multi-report (bulk) submit into one, so a single modal can list every
 * violation across the whole selection without repeating one that appears on more than one report.
 */
function mergeReportSubmitViolationSummaries(summaries: ReportSubmitViolationSummary[]): ReportSubmitViolationSummary {
    const otherViolations = new Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>();
    let hasRejectedExpense = false;
    let hasReportBeenRejected = false;
    let hasPendingCardMatch = false;
    let hasMissingMerchant = false;
    let hasMissingAmount = false;

    for (const summary of summaries) {
        hasRejectedExpense ||= summary.hasRejectedExpense;
        hasReportBeenRejected ||= summary.hasReportBeenRejected;
        hasPendingCardMatch ||= summary.hasPendingCardMatch;
        hasMissingMerchant ||= summary.hasMissingMerchant;
        hasMissingAmount ||= summary.hasMissingAmount;
        for (const [violationName, violation] of summary.otherViolations) {
            if (!otherViolations.has(violationName)) {
                otherViolations.set(violationName, violation);
            }
        }
    }

    return {hasRejectedExpense, hasReportBeenRejected, hasPendingCardMatch, hasMissingMerchant, hasMissingAmount, otherViolations};
}

export {getReportSubmitViolationSummary, buildSubmitViolationBullets, hasAnySubmitViolation, shouldResolveAcknowledgedViolations, mergeReportSubmitViolationSummaries};
