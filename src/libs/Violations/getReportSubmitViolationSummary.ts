import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import Parser from '@libs/Parser';
import {hasReportBeenRejectedToSubmitter} from '@libs/ReportUtils';
import {hasPendingRTERViolation, hasTransactionBeenRejected, isPendingRTERViolation, shouldShowViolation} from '@libs/TransactionUtils';

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
    /** First-seen violation instance per violation name, so the full message (with amounts/thresholds) can be built later */
    otherViolations: Map<ValueOf<typeof CONST.VIOLATIONS>, TransactionViolation>;
};

/**
 * Classifies a report's transaction violations into the four buckets shown by the "Submit report?" confirmation
 * modal: a rejected expense, a whole-report rejection, a pending RTER/card-match, or everything else (informational
 * only).
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
 * receipt required". That translation can include an HTML link (e.g. a broken-connection RTER message), which this
 * modal has no renderer for and which this call site doesn't have the data to build anyway (company-card page URL,
 * broken personal-card reconnect link); stripped to plain text here so an admin never sees a raw `<a href="...">`.
 */
function buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString}: BuildSubmitViolationBulletsParams): string[] {
    const bullets: string[] = [];

    for (const violation of summary.otherViolations.values()) {
        bullets.push(Parser.htmlToText(ViolationsUtils.getViolationTranslation({violation, translate, dateFnsLocale, convertToDisplayString})));
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
    return summary.hasRejectedExpense || summary.hasReportBeenRejected || summary.hasPendingCardMatch || summary.otherViolations.size > 0;
}

/** The shouldResolveAcknowledgedViolations flag to submit with, once the user has confirmed the modal. */
function shouldResolveAcknowledgedViolations(summary: ReportSubmitViolationSummary): boolean {
    return summary.hasRejectedExpense || summary.hasPendingCardMatch;
}

/**
 * Whether a pending card match is the only reason the modal has anything to show. Unlike every other violation
 * here, a pending card match never blocked Submit on its own before this modal existed - the user was only ever
 * asked whether to mark it as cash first, and either answer still submitted. Cancelling this modal must keep doing
 * the same when nothing else needs acknowledging, or a card transaction that later tries to match this expense can
 * no longer merge into it.
 */
function hasOnlyPendingCardMatch(summary: ReportSubmitViolationSummary): boolean {
    return summary.hasPendingCardMatch && !summary.hasRejectedExpense && !summary.hasReportBeenRejected && summary.otherViolations.size === 0;
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

    for (const summary of summaries) {
        hasRejectedExpense ||= summary.hasRejectedExpense;
        hasReportBeenRejected ||= summary.hasReportBeenRejected;
        hasPendingCardMatch ||= summary.hasPendingCardMatch;
        for (const [violationName, violation] of summary.otherViolations) {
            if (!otherViolations.has(violationName)) {
                otherViolations.set(violationName, violation);
            }
        }
    }

    return {hasRejectedExpense, hasReportBeenRejected, hasPendingCardMatch, otherViolations};
}

export {
    getReportSubmitViolationSummary,
    buildSubmitViolationBullets,
    hasAnySubmitViolation,
    shouldResolveAcknowledgedViolations,
    hasOnlyPendingCardMatch,
    mergeReportSubmitViolationSummaries,
};
