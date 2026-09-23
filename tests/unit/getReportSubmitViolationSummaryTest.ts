import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {buildSubmitViolationBullets, getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';

import createMock from '../utils/createMock';

const shortNameTranslations = new Map<string, string>([['violations.shortName.overCategoryLimit', 'Over category limit']]);

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the test double to the wider LocaleContextProps['translate'] signature the function under test expects
const translate = jest.fn((key: string, param?: string) => {
    const shortName = shortNameTranslations.get(key);
    if (shortName !== undefined) {
        return shortName;
    }
    return param !== undefined ? `${key}(${param})` : key;
}) as unknown as LocaleContextProps['translate'];

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
        expect(summary).toEqual({hasRejectedExpense: false, hasPendingCardMatch: false, otherViolationNames: new Set()});
    });

    it('flags a rejected expense violation', () => {
        // Given a transaction whose expense was rejected by the backend
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]}, undefined);

        // When the summary is built
        // Then it must surface as the dedicated "rejected expense" bucket, not get lumped into the generic "other" bucket,
        // because the caller needs to distinguish it to set shouldResolveAcknowledgedViolations on submit
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.otherViolationNames.size).toBe(0);
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
        const summary = getReportSubmitViolationSummary(
            [transaction('1')],
            {
                [violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true, rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION})],
            },
            undefined,
        );

        // When the summary is built
        // Then it must not be treated as a pending card match (markPendingRTERTransactionsAsCash would be wrong here),
        // and it must still be visible to the user as an informational "other" bullet instead of disappearing
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.hasRejectedExpense).toBe(false);
        expect(summary.otherViolationNames).toEqual(new Set([CONST.VIOLATIONS.RTER]));
    });

    it('buckets any other violation name into otherViolationNames', () => {
        // Given a transaction with a violation that isn't rejected-expense or RTER (e.g. a policy category limit)
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: [violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)]}, undefined);

        // When the summary is built
        // Then it must be collected as an informational-only bullet, since the modal only needs to warn the user, not resolve anything
        expect(summary.otherViolationNames).toEqual(new Set([CONST.VIOLATIONS.OVER_CATEGORY_LIMIT]));
    });

    it('aggregates violations across multiple transactions', () => {
        // Given two transactions on the same report, each with a different kind of violation
        const summary = getReportSubmitViolationSummary(
            [transaction('1'), transaction('2')],
            {
                [violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)],
                [violationsKey('2')]: [violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)],
            },
            undefined,
        );

        // When the summary is built for the whole report
        // Then it must reflect violations from every transaction, not just the first one, since submitting the report affects all of them
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.otherViolationNames).toEqual(new Set([CONST.VIOLATIONS.OVER_CATEGORY_LIMIT]));
    });

    it('ignores transactions with no violations entry', () => {
        // Given a transaction whose violations haven't been fetched into Onyx yet (key absent from the collection)
        const summary = getReportSubmitViolationSummary([transaction('1')], {}, undefined);

        // When the summary is built
        // Then it must not throw or treat the missing key as a violation, so a report just isn't flagged instead of crashing
        expect(summary).toEqual({hasRejectedExpense: false, hasPendingCardMatch: false, otherViolationNames: new Set()});
    });

    it('flags a rejected expense when the whole report was rejected to the submitter, even with no transaction violations', () => {
        // Given a report that was rejected in full (nextStep.messageKey is REJECTED_REPORT, report reopened to OPEN),
        // where the individual transactions carry no AUTO_REPORTED_REJECTED_EXPENSE violation of their own
        const summary = getReportSubmitViolationSummary([transaction('1')], {[violationsKey('1')]: []}, rejectedReport());

        // When the summary is built
        // Then it must still surface the "rejected expense" bucket, since a whole-report rejection is a report-level state
        // (not a TransactionViolations entry) that the modal must warn about all the same
        expect(summary.hasRejectedExpense).toBe(true);
    });

    it('does not flag a rejected expense for a report in a different state than OPEN, even with a REJECTED_REPORT nextStep', () => {
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
        expect(summary.hasRejectedExpense).toBe(false);
    });
});

describe('buildSubmitViolationBullets', () => {
    it('returns an empty list when there is nothing to report', () => {
        // Given a summary where every bucket is empty
        // When the bullets are built
        // Then there is nothing for the modal to show, so the list must be empty
        expect(buildSubmitViolationBullets({hasRejectedExpense: false, hasPendingCardMatch: false, otherViolationNames: new Set()}, translate)).toEqual([]);
    });

    it('orders other-violation bullets before the fixed rejected/pending-card-match bullets', () => {
        // Given a summary with all three kinds of violation present at once
        // When the bullets are built
        // Then the order must be stable (other violations first, then rejected, then pending-card-match) so the modal
        // copy doesn't shuffle between renders and matches the approved mockup
        const bullets = buildSubmitViolationBullets({hasRejectedExpense: true, hasPendingCardMatch: true, otherViolationNames: new Set([CONST.VIOLATIONS.OVER_CATEGORY_LIMIT])}, translate);

        expect(bullets).toEqual([
            'iou.confirmSubmitReportViolations.otherViolation(over category limit)',
            'iou.confirmSubmitReportViolations.rejectedExpense',
            'iou.confirmSubmitReportViolations.pendingCardMatch',
        ]);
    });
});
