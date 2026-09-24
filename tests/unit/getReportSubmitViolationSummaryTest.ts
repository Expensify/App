import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {buildSubmitViolationBullets, getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';

import createMock from '../utils/createMock';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the test double to the wider LocaleContextProps['translate'] signature the function under test expects
const translate = jest.fn((key: string, ...params: unknown[]) => {
    const suffix = params.filter((param) => param !== undefined && param !== '').join(',');
    return suffix.length > 0 ? `${key}(${suffix})` : key;
}) as unknown as LocaleContextProps['translate'];

const convertToDisplayString = jest.fn((amount: number, currency: string) => `${amount} ${currency}`);

// Not exercised by the violation types covered here (overCategoryLimit doesn't need a formatted date), but
// required by buildSubmitViolationBullets's params shape.
const dateFnsLocale = {} as LocaleContextProps['dateFnsLocale'];

function violationsKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
}

function transaction(transactionID: string): Transaction {
    return createMock<Transaction>({transactionID});
}

function violation(name: TransactionViolation['name'], data?: TransactionViolation['data']): TransactionViolation {
    return createMock<TransactionViolation>({name, data});
}

function rejectedReport(): Report {
    return createMock<Report>({
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
    });
}

describe('getReportSubmitViolationSummary', () => {
    it('returns all-false/empty when there are no violations', () => {
        // Given a transaction with an empty violations array (the shape Onyx reports once violations have been computed and none apply)
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: []}, undefined);

        // When the summary is built
        // Then the "Submit report?" modal has nothing to show, so every bucket must be empty
        expect(summary).toEqual({hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false, otherViolations: new Map()});
    });

    it('flags a rejected expense violation', () => {
        // Given a transaction whose expense was rejected by the backend
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]}, undefined);

        // When the summary is built
        // Then it must surface as the dedicated "rejected expense" bucket, not get lumped into the generic "other" bucket,
        // because the caller needs to distinguish it to set shouldResolveAcknowledgedViolations on submit
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.otherViolations.size).toBe(0);
    });

    it('flags a pending RTER card-match violation', () => {
        // Given a transaction awaiting a potential match with a card transaction (pendingPattern, no rterType)
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]}, undefined);

        // When the summary is built
        // Then it must land in the dedicated "pending card match" bucket, since that's the one the caller uses to
        // decide whether to call markPendingRTERTransactionsAsCash on submit
        expect(summary.hasPendingCardMatch).toBe(true);
        expect(summary.hasRejectedExpense).toBe(false);
    });

    it('buckets a broken-connection RTER violation as an "other" violation instead of dropping it', () => {
        // Given a transaction with an RTER violation caused by a broken bank connection rather than a pending card match
        // (regression test: a prior version of the loop skipped every RTER-named violation, silently dropping this one)
        const rterViolation = violation(CONST.VIOLATIONS.RTER, {pendingPattern: true, rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION});
        const summary = getReportSubmitViolationSummary(
            [transaction('1')],
            {
                [violationsKey('1')]: [rterViolation],
            },
            undefined,
        );

        // When the summary is built
        // Then it must not be treated as a pending card match (markPendingRTERTransactionsAsCash would be wrong here),
        // and it must still be visible to the user as an informational "other" bullet instead of disappearing
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.hasRejectedExpense).toBe(false);
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.RTER, rterViolation]]));
    });

    it('buckets any other violation name into otherViolations', () => {
        // Given a transaction with a violation that isn't rejected-expense or RTER (e.g. a policy category limit)
        const overCategoryLimitViolation = violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT);
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: [overCategoryLimitViolation]}, undefined);

        // When the summary is built
        // Then it must be collected as an informational-only bullet, since the modal only needs to warn the user, not resolve anything
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, overCategoryLimitViolation]]));
    });

    it('aggregates violations across multiple transactions', () => {
        // Given two transactions on the same report, each with a different kind of violation
        const overCategoryLimitViolation = violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT);
        const summary = getReportSubmitViolationSummary(
            [transaction('1'), transaction('2')],
            {
                [violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)],
                [violationsKey('2')]: [overCategoryLimitViolation],
            },
            undefined,
        );

        // When the summary is built for the whole report
        // Then it must reflect violations from every transaction, not just the first one, since submitting the report affects all of them
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, overCategoryLimitViolation]]));
    });

    it('ignores transactions with no violations entry', () => {
        // Given a transaction whose violations haven't been fetched into Onyx yet (key absent from the collection)
        const summary = getReportSubmitViolationSummary([transaction('1')], {}, undefined);

        // When the summary is built
        // Then it must not throw or treat the missing key as a violation, so a report just isn't flagged instead of crashing
        expect(summary).toEqual({hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false, otherViolations: new Map()});
    });

    it('flags a report-level rejection separately from a transaction-level rejected-expense violation', () => {
        // Given a report that was rejected in full (nextStep.messageKey is REJECTED_REPORT, report reopened to OPEN),
        // where the individual transactions carry no AUTO_REPORTED_REJECTED_EXPENSE violation of their own - the PO
        // asked for these two cases to use different copy, since a report-level rejection has no per-expense
        // "Mark as resolved" action, unlike a transaction-level rejected-expense violation
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: []}, rejectedReport());

        // When the summary is built
        // Then it must surface the report-level rejection in its own bucket, and must NOT also flag the
        // transaction-level rejected-expense bucket, since no transaction actually carries that violation
        expect(summary.hasReportBeenRejected).toBe(true);
        expect(summary.hasRejectedExpense).toBe(false);
    });

    it('does not flag a report-level rejection for a report in a different state than OPEN, even with a REJECTED_REPORT nextStep', () => {
        // Given a report whose nextStep still carries a stale REJECTED_REPORT messageKey but whose stateNum has moved on
        // (e.g. resubmitted and now back in an approval state)
        const summary = getReportSubmitViolationSummary(
            [transaction('1')],
            {[violationsKey('1')]: []},
            createMock<Report>({
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
            }),
        );

        // When the summary is built
        // Then it must not treat the report as currently rejected, since stateNum no longer reflects the rejected-and-reopened state
        expect(summary.hasReportBeenRejected).toBe(false);
    });
});

describe('buildSubmitViolationBullets', () => {
    it('returns an empty list when there is nothing to report', () => {
        // Given a summary where every bucket is empty
        const summary = {hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false, otherViolations: new Map()};

        // When the bullets are built
        // Then there is nothing for the modal to show, so the list must be empty
        expect(buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString})).toEqual([]);
    });

    it('orders bullets: other violations first, then report rejection, then expense rejection, then pending-card-match', () => {
        // Given a summary with every kind of violation present at once
        const summary = {
            hasRejectedExpense: true,
            hasReportBeenRejected: true,
            hasPendingCardMatch: true,
            otherViolations: new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)]]),
        };

        // When the bullets are built
        const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

        // Then the order must be stable so the modal copy doesn't shuffle between renders, and the other-violation
        // bullet must use the full violation message (with the interpolated amount), not the short label
        expect(bullets).toEqual([
            'violations.overCategoryLimit(0 USD)',
            'iou.confirmSubmitReportViolations.reportRejected',
            'iou.confirmSubmitReportViolations.rejectedExpense',
            'iou.confirmSubmitReportViolations.pendingCardMatch',
        ]);
    });

    it('builds the full receipt-required message with the formatted threshold amount, not the short label', () => {
        // Given a receipt-required violation whose data carries the policy's no-receipt amount threshold (e.g. $25)
        const receiptRequiredViolation = violation(CONST.VIOLATIONS.RECEIPT_REQUIRED, {amount: 2500, currency: 'USD'});
        const summary = {
            hasRejectedExpense: false,
            hasReportBeenRejected: false,
            hasPendingCardMatch: false,
            otherViolations: new Map([[CONST.VIOLATIONS.RECEIPT_REQUIRED, receiptRequiredViolation]]),
        };

        // When the bullets are built
        const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

        // Then the bullet must mention the actual threshold amount (via convertToDisplayString), matching the full
        // message shown elsewhere in the app (e.g. the RBR message under an expense row), instead of a generic
        // short label that drops the amount - this is the PO's explicit ask on the PR review
        expect(convertToDisplayString).toHaveBeenCalledWith(2500, 'USD');
        expect(bullets).toEqual(['violations.receiptRequired(2500 USD)']);
    });
});
