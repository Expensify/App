import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {hasPendingRTERViolation, hasTransactionBeenRejected, isBrokenConnectionViolation} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type ReportSubmitViolationSummary = {
    hasRejectedExpense: boolean;
    hasPendingCardMatch: boolean;
    otherViolationNames: Set<ValueOf<typeof CONST.VIOLATIONS>>;
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
    let hasRejectedExpense = hasReportBeenRejectedToSubmitter(report);
    let hasPendingCardMatch = false;
    const otherViolationNames = new Set<ValueOf<typeof CONST.VIOLATIONS>>();

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
            otherViolationNames.add(violation.name);
        }
    }

    return {hasRejectedExpense, hasPendingCardMatch, otherViolationNames};
}

function lowercaseFirst(value: string): string {
    return value.length > 0 ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

/** Builds the modal's bullet copy, in a fixed order: other violations first, then rejected, then pending card match. */
function buildSubmitViolationBullets(summary: ReportSubmitViolationSummary, translate: LocaleContextProps['translate']): string[] {
    const bullets: string[] = [];

    for (const name of summary.otherViolationNames) {
        const shortLabel = translate(`violations.shortName.${name}` as TranslationPaths);
        bullets.push(translate('iou.confirmSubmitReportViolations.otherViolation', lowercaseFirst(shortLabel)));
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
