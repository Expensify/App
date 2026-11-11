import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {
    buildSubmitViolationBullets,
    getReportSubmitViolationSummary,
    hasAnySubmitViolation,
    mergeReportSubmitViolationSummaries,
    shouldResolveAcknowledgedViolations,
} from '@libs/Violations/getReportSubmitViolationSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';

import createMock from '../utils/createMock';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the test double to the wider LocaleContextProps['translate'] signature the function under test expects
const translate = jest.fn((key: string, ...params: unknown[]) => {
    const suffix = params.filter((param) => param !== undefined && param !== '').join(',');
    return suffix.length > 0 ? `${key}(${suffix})` : key;
}) as unknown as LocaleContextProps['translate'];

const convertToDisplayString = jest.fn((amount: number | undefined, currency: string | undefined) => `${amount} ${currency}`);

// Not exercised by the violation types covered here (overCategoryLimit doesn't need a formatted date), but
// required by buildSubmitViolationBullets's params shape.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test double stands in for the unused date-fns Locale param
const dateFnsLocale = {} as LocaleContextProps['dateFnsLocale'];

function getViolationsKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
}

function createMockTransaction(transactionID: string): Transaction {
    return createMock<Transaction>({transactionID});
}

function createMockViolation(name: TransactionViolation['name'], data?: TransactionViolation['data']): TransactionViolation {
    return createMock<TransactionViolation>({name, data});
}

function createMockExpenseReport(): Report {
    return createMock<Report>({type: CONST.REPORT.TYPE.EXPENSE});
}

function createMockTransactionWithMerchant(merchant: string, overrides?: Partial<Transaction>): Transaction {
    return createMock<Transaction>({transactionID: '1', merchant, ...overrides});
}

function createMockFailedScan(overrides?: Partial<Transaction>): Transaction {
    return createMock<Transaction>({
        transactionID: '1',
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        amount: 0,
        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        ...overrides,
    });
}

function createEmptySummary() {
    return {hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false, hasMissingMerchant: false, hasMissingAmount: false, otherViolations: new Map()};
}

function createMockRejectedReport(): Report {
    return createMock<Report>({
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
    });
}

describe('getReportSubmitViolationSummary', () => {
    it('returns all-false/empty when there are no violations', () => {
        // Given a transaction with an empty violations array (the shape Onyx reports once violations have been computed and none apply)
        const summary = getReportSubmitViolationSummary([createMockTransaction('1')], {[getViolationsKey('1')]: []}, undefined, undefined, '', 0);

        // When the summary is built
        // Then the "Submit report?" modal has nothing to show, so every bucket must be empty
        expect(summary).toEqual(createEmptySummary());
    });

    it('flags a rejected expense violation', () => {
        // Given a transaction whose expense was rejected by the backend
        const summary = getReportSubmitViolationSummary(
            [createMockTransaction('1')],
            {[getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]},
            undefined,
            undefined,
            '',
            0,
        );

        // When the summary is built
        // Then it must surface as the dedicated "rejected expense" bucket, not get lumped into the generic "other" bucket,
        // because the caller needs to distinguish it to set shouldResolveAcknowledgedViolations on submit
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.otherViolations.size).toBe(0);
    });

    it('flags a pending RTER card-match violation', () => {
        // Given a transaction awaiting a potential match with a card transaction (pendingPattern, no rterType)
        const summary = getReportSubmitViolationSummary(
            [createMockTransaction('1')],
            {[getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]},
            undefined,
            undefined,
            '',
            0,
        );

        // When the summary is built
        // Then it must land in the dedicated "pending card match" bucket, since that's the one the modal uses to
        // show the pending-card-match bullet and gate the shouldResolveAcknowledgedViolations flag
        expect(summary.hasPendingCardMatch).toBe(true);
        expect(summary.hasRejectedExpense).toBe(false);
    });

    it('buckets a broken-connection RTER violation as an "other" violation instead of dropping it', () => {
        // Given a transaction with an RTER violation caused by a broken bank connection rather than a pending card match
        // (regression test: a prior version of the loop skipped every RTER-named violation, silently dropping this one).
        // RTER is only shown to the report's submitter, so the report must be owned by the current test user.
        const currentUserAccountID = 1;
        const ownedReport = createMock<Report>({ownerAccountID: currentUserAccountID});
        const rterViolation = createMockViolation(CONST.VIOLATIONS.RTER, {pendingPattern: true, rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION});
        const summary = getReportSubmitViolationSummary(
            [createMockTransaction('1')],
            {
                [getViolationsKey('1')]: [rterViolation],
            },
            ownedReport,
            undefined,
            '',
            currentUserAccountID,
        );

        // When the summary is built
        // Then it must not be treated as a pending card match (the pending-card-match bullet copy would be wrong
        // here), and it must still be visible to the user as an informational "other" bullet instead of disappearing
        expect(summary.hasPendingCardMatch).toBe(false);
        expect(summary.hasRejectedExpense).toBe(false);
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.RTER, rterViolation]]));
    });

    it('buckets any other violation name into otherViolations', () => {
        // Given a transaction with a violation that isn't rejected-expense or RTER (e.g. a policy category limit)
        const overCategoryLimitViolation = createMockViolation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT);
        const summary = getReportSubmitViolationSummary([createMockTransaction('1')], {[getViolationsKey('1')]: [overCategoryLimitViolation]}, undefined, undefined, '', 0);

        // When the summary is built
        // Then it must be collected as an informational-only bullet, since the modal only needs to warn the user, not resolve anything
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, overCategoryLimitViolation]]));
    });

    it('aggregates violations across multiple transactions', () => {
        // Given two transactions on the same report, each with a different kind of violation
        const overCategoryLimitViolation = createMockViolation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT);
        const summary = getReportSubmitViolationSummary(
            [createMockTransaction('1'), createMockTransaction('2')],
            {
                [getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)],
                [getViolationsKey('2')]: [overCategoryLimitViolation],
            },
            undefined,
            undefined,
            '',
            0,
        );

        // When the summary is built for the whole report
        // Then it must reflect violations from every transaction, not just the first one, since submitting the report affects all of them
        expect(summary.hasRejectedExpense).toBe(true);
        expect(summary.otherViolations).toEqual(new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, overCategoryLimitViolation]]));
    });

    it('ignores transactions with no violations entry', () => {
        // Given a transaction whose violations haven't been fetched into Onyx yet (key absent from the collection)
        const summary = getReportSubmitViolationSummary([createMockTransaction('1')], {}, undefined, undefined, '', 0);

        // When the summary is built
        // Then it must not throw or treat the missing key as a violation, so a report just isn't flagged instead of crashing
        expect(summary).toEqual(createEmptySummary());
    });

    it('flags a report-level rejection separately from a transaction-level rejected-expense violation', () => {
        // Given a report that was rejected in full (nextStep.messageKey is REJECTED_REPORT, report reopened to OPEN),
        // where the individual transactions carry no AUTO_REPORTED_REJECTED_EXPENSE violation of their own - the PO
        // asked for these two cases to use different copy, since a report-level rejection has no per-expense
        // "Mark as resolved" action, unlike a transaction-level rejected-expense violation
        const summary = getReportSubmitViolationSummary([createMockTransaction('1')], {[getViolationsKey('1')]: []}, createMockRejectedReport(), undefined, '', 0);

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
            [createMockTransaction('1')],
            {[getViolationsKey('1')]: []},
            createMock<Report>({
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
            }),
            undefined,
            '',
            0,
        );

        // When the summary is built
        // Then it must not treat the report as currently rejected, since stateNum no longer reflects the rejected-and-reopened state
        expect(summary.hasReportBeenRejected).toBe(false);
    });

    describe('missing merchant', () => {
        it.each([
            ['empty', ''],
            ['the partial placeholder', CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT],
            ['the default placeholder', CONST.TRANSACTION.DEFAULT_MERCHANT],
        ])('flags an expense on an expense report whose merchant is %s', (_description, merchant) => {
            // Given an expense whose merchant is a value the expense row treats as missing, with no violations entry,
            // because the server never sends a violation for a missing merchant
            const summary = getReportSubmitViolationSummary([createMockTransactionWithMerchant(merchant)], {}, createMockExpenseReport(), undefined, '', 0);

            // When the summary is built
            // Then it must flag the merchant, otherwise the report submits with no warning while the expense row shows an error
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it('flags a missing merchant when the expense has an empty violations list', () => {
            // Given an expense with no merchant whose violations are known to be empty, a different Onyx state from an absent entry
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT)],
                {[getViolationsKey('1')]: []},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then the merchant must still be flagged, since it doesn't depend on the expense having violations
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it('lists the missing merchant alongside the violations of other expenses on the report', () => {
            // Given a report like the one in the bug report: one expense with a policy violation, and another with no
            // merchant that also has a violation of its own
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant('Merchant', {transactionID: '1'}), createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {transactionID: '2'})],
                {
                    [getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)],
                    [getViolationsKey('2')]: [createMockViolation(CONST.VIOLATIONS.MISSING_CATEGORY)],
                },
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the bullets are built from the summary
            const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

            // Then the modal must show the merchant as well as both violations, since the bug was that the violations hid it
            expect(bullets).toHaveLength(3);
            expect(bullets).toContain('iou.missingMerchant');
        });

        it('does not flag a placeholder merchant that a valid modified merchant has replaced', () => {
            // Given an expense created with the placeholder merchant and then edited to a real one, which is stored in modifiedMerchant
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {modifiedMerchant: 'Merchant'})],
                {},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, since the user has already fixed the merchant
            expect(summary.hasMissingMerchant).toBe(false);
        });

        it('flags a valid merchant that has been replaced by a placeholder modified merchant', () => {
            // Given an expense whose modified merchant takes priority over its original merchant and is a placeholder
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant('Merchant', {modifiedMerchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT})],
                {},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must warn, because the expense row reads the same modified merchant and shows the error
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it.each([
            ['a distance expense', {iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE}],
            ['a receipt waiting to be scanned', {receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_READY}}],
            ['a receipt being scanned', {receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}}],
            ['an expense being deleted', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
        ])('does not flag %s', (_description, overrides: Partial<Transaction>) => {
            // Given an expense with a placeholder merchant that the expense row doesn't treat as an error
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, overrides)],
                {},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, otherwise the modal would report a problem that no other screen shows
            expect(summary.hasMissingMerchant).toBe(false);
        });

        it('does not flag a placeholder merchant on an IOU report, even when another required field is empty', () => {
            // Given an IOU, where a merchant is optional, with a zero amount that makes hasMissingSmartscanFields true by itself
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {amount: 0})],
                {},
                createMock<Report>({type: CONST.REPORT.TYPE.IOU}),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn about the merchant, since only expense reports require one
            expect(summary.hasMissingMerchant).toBe(false);
        });

        it('does not flag a held expense, because submitting moves it to a new draft report', () => {
            // Given a clean expense and a held expense with no merchant, on a workflow that splits held expenses out when submitting
            const summary = getReportSubmitViolationSummary(
                [
                    createMockTransactionWithMerchant('Merchant', {transactionID: '1'}),
                    createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {transactionID: '2', comment: {hold: '123'}}),
                ],
                {},
                createMockExpenseReport(),
                createMock<Policy>({approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}),
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, since nothing that is actually being submitted lacks a merchant
            expect(summary.hasMissingMerchant).toBe(false);
        });

        it('flags a held expense on a dynamic external workflow, because held expenses stay on the report there', () => {
            // Given a held expense with no merchant on a dynamic external workflow, which doesn't split held expenses out
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {comment: {hold: '123'}})],
                {},
                createMockExpenseReport(),
                createMock<Policy>({approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL}),
                '',
                0,
            );

            // When the summary is built
            // Then it must warn, because this expense is submitted along with the rest of the report
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it('flags an expense that is not held when another expense on the report is held', () => {
            // Given two expenses with no merchant, where only one is held
            const summary = getReportSubmitViolationSummary(
                [
                    createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {transactionID: '1', comment: {hold: '123'}}),
                    createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {transactionID: '2'}),
                ],
                {},
                createMockExpenseReport(),
                createMock<Policy>({approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}),
                '',
                0,
            );

            // When the summary is built
            // Then it must warn, since the expense that isn't held is still being submitted without a merchant
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it('does not add a second bullet for a failed scan that already has a smartscanFailed violation', () => {
            // Given a failed scan with no merchant, whose smartscanFailed message already tells the submitter to enter the details
            const summary = getReportSubmitViolationSummary(
                [
                    createMockTransactionWithMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, {
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
                    }),
                ],
                {[getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.SMARTSCAN_FAILED, {missingFields: ['merchant']})]},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the bullets are built from the summary
            const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

            // Then only the scan failure is listed, because a separate merchant bullet would report the same problem twice
            expect(summary.hasMissingMerchant).toBe(false);
            expect(bullets).toHaveLength(1);
            expect(bullets).not.toContain('iou.missingMerchant');
        });

        it('flags a different expense with no merchant on the same report as a failed scan', () => {
            // Given a failed scan with a smartscanFailed violation, next to a separate manual expense with no merchant
            const summary = getReportSubmitViolationSummary(
                [
                    createMockTransactionWithMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, {
                        transactionID: '1',
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
                    }),
                    createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {transactionID: '2'}),
                ],
                {[getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.SMARTSCAN_FAILED)]},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then the manual expense must still be flagged, because the scan failure only covers its own expense
            expect(summary.hasMissingMerchant).toBe(true);
        });

        it('flags a failed scan with no merchant once its smartscanFailed violation is gone', () => {
            // Given a failed scan with no merchant whose smartscanFailed violation was removed after the user entered the amount
            const summary = getReportSubmitViolationSummary([createMockFailedScan({modifiedAmount: -1000})], {[getViolationsKey('1')]: []}, createMockExpenseReport(), undefined, '', 0);

            // When the summary is built
            // Then it must warn about the merchant only, since nothing else now tells the submitter it's missing and the amount has been entered
            expect(summary.hasMissingMerchant).toBe(true);
            expect(summary.hasMissingAmount).toBe(false);
        });

        it('does not flag a placeholder merchant when the report is not available', () => {
            // Given a report that hasn't loaded, so there is no way to tell whether a merchant is required
            const summary = getReportSubmitViolationSummary([createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT)], {}, undefined, undefined, '', 0);

            // When the summary is built
            // Then it must not warn, rather than interrupt a submission over a merchant that may be optional
            expect(summary.hasMissingMerchant).toBe(false);
        });
    });

    describe('missing amount', () => {
        it('flags a failed scan whose amount was never entered, once the merchant is fixed and smartscanFailed is gone', () => {
            // Given a failed scan where the user entered only the merchant, which makes the server remove smartscanFailed while the amount stays 0
            const summary = getReportSubmitViolationSummary(
                [createMockFailedScan({modifiedMerchant: 'Merchant'})],
                {[getViolationsKey('1')]: []},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the bullets are built from the summary
            const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

            // Then the amount must be listed, because the expense row shows this error and nothing else in the modal would mention it
            expect(summary.hasMissingAmount).toBe(true);
            expect(summary.hasMissingMerchant).toBe(false);
            expect(bullets).toEqual(['iou.missingAmount']);
        });

        it('flags both fields when a failed scan has neither and smartscanFailed is gone', () => {
            // Given a failed scan with no merchant and no amount, and no smartscanFailed violation to mention them
            const summary = getReportSubmitViolationSummary([createMockFailedScan()], {[getViolationsKey('1')]: []}, createMockExpenseReport(), undefined, '', 0);

            // When the bullets are built from the summary
            const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

            // Then both are listed, since the submitter has to fix each one
            expect(bullets).toEqual(['iou.missingMerchant', 'iou.missingAmount']);
        });

        it('does not add a second bullet when the failed scan still has its smartscanFailed violation', () => {
            // Given a failed scan whose smartscanFailed message already names the missing amount
            const summary = getReportSubmitViolationSummary(
                [createMockFailedScan()],
                {[getViolationsKey('1')]: [createMockViolation(CONST.VIOLATIONS.SMARTSCAN_FAILED, {missingFields: ['amount']})]},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not flag the amount, because that would report the same problem twice
            expect(summary.hasMissingAmount).toBe(false);
        });

        it('does not flag a manual expense with a zero amount', () => {
            // Given a manual expense for 0 on an expense report, which is a valid amount there
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant('Merchant', {amount: 0, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL})],
                {},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, otherwise a clean report with a zero amount would stop submitting immediately
            expect(summary.hasMissingAmount).toBe(false);
            expect(hasAnySubmitViolation(summary)).toBe(false);
        });

        it('flags only the merchant on a manual expense with a zero amount and no merchant', () => {
            // Given a manual expense for 0, a valid amount on an expense report, whose missing merchant makes it pass the required fields check
            const summary = getReportSubmitViolationSummary(
                [createMockTransactionWithMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT, {amount: 0, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL})],
                {},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not also report a missing amount, because only a failed scan's placeholder counts as one
            expect(summary.hasMissingMerchant).toBe(true);
            expect(summary.hasMissingAmount).toBe(false);
        });

        it('does not flag a failed scan once the amount has been entered', () => {
            // Given a failed scan where the user has entered the amount, which is stored in modifiedAmount
            const summary = getReportSubmitViolationSummary(
                [createMockFailedScan({modifiedMerchant: 'Merchant', modifiedAmount: -1000})],
                {[getViolationsKey('1')]: []},
                createMockExpenseReport(),
                undefined,
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, since the user has already fixed the amount
            expect(summary.hasMissingAmount).toBe(false);
        });

        it('does not flag a held failed scan, because submitting moves it to a new draft report', () => {
            // Given a held failed scan on a workflow that splits held expenses out when submitting
            const summary = getReportSubmitViolationSummary(
                [createMockFailedScan({modifiedMerchant: 'Merchant', comment: {hold: '123'}})],
                {},
                createMockExpenseReport(),
                createMock<Policy>({approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}),
                '',
                0,
            );

            // When the summary is built
            // Then it must not warn, since this expense isn't part of the submission
            expect(summary.hasMissingAmount).toBe(false);
        });

        it('does not flag a failed scan on an IOU report', () => {
            // Given a failed scan on an IOU, which this warning doesn't cover
            const summary = getReportSubmitViolationSummary([createMockFailedScan({modifiedMerchant: 'Merchant'})], {}, createMock<Report>({type: CONST.REPORT.TYPE.IOU}), undefined, '', 0);

            // When the summary is built
            // Then it must not warn, because only expense reports go through these checks
            expect(summary.hasMissingAmount).toBe(false);
        });
    });
});

describe('hasAnySubmitViolation', () => {
    it('returns true when a missing merchant is the only thing to show', () => {
        // Given a summary with no violations of any kind, only a missing merchant
        const summary = {...createEmptySummary(), hasMissingMerchant: true};

        // When deciding whether to show the modal
        // Then the modal must open, otherwise the warning would only appear when an unrelated violation happens to exist
        expect(hasAnySubmitViolation(summary)).toBe(true);
    });

    it('returns true when a missing amount is the only thing to show', () => {
        // Given a summary with no violations of any kind, only a missing amount
        const summary = {...createEmptySummary(), hasMissingAmount: true};

        // When deciding whether to show the modal
        // Then the modal must open, otherwise an expense with no amount would be submitted with no warning
        expect(hasAnySubmitViolation(summary)).toBe(true);
    });

    it('returns false when the summary is empty', () => {
        // Given a summary with nothing in any bucket
        // When deciding whether to show the modal
        // Then a clean report must keep submitting immediately, with no extra prompt
        expect(hasAnySubmitViolation(createEmptySummary())).toBe(false);
    });
});

describe('shouldResolveAcknowledgedViolations', () => {
    it('does not resolve anything when a missing merchant is the only thing acknowledged', () => {
        // Given a summary whose only entry is a missing merchant
        const summary = {...createEmptySummary(), hasMissingMerchant: true};

        // When the user confirms "Submit anyway"
        // Then the flag must stay false, since acknowledging the modal doesn't fix the merchant and there is no rejected expense to resolve
        expect(shouldResolveAcknowledgedViolations(summary)).toBe(false);
    });

    it('does not resolve anything when a missing amount is the only thing acknowledged', () => {
        // Given a summary whose only entry is a missing amount
        const summary = {...createEmptySummary(), hasMissingAmount: true};

        // When the user confirms "Submit anyway"
        // Then the flag must stay false, since acknowledging the modal doesn't fix the amount and there is no rejected expense to resolve
        expect(shouldResolveAcknowledgedViolations(summary)).toBe(false);
    });
});

describe('mergeReportSubmitViolationSummaries', () => {
    it('keeps the missing merchant flag when only one of the selected reports has it', () => {
        // Given a bulk submit where one report has a missing merchant and another is clean
        const summaries = [createEmptySummary(), {...createEmptySummary(), hasMissingMerchant: true}];

        // When the summaries are merged into the single modal for the selection
        // Then the flag must survive, otherwise the warning would disappear in bulk submit
        expect(mergeReportSubmitViolationSummaries(summaries).hasMissingMerchant).toBe(true);
    });

    it('keeps the missing amount flag when only one of the selected reports has it', () => {
        // Given a bulk submit where one report has a missing amount and another is clean
        const summaries = [createEmptySummary(), {...createEmptySummary(), hasMissingAmount: true}];

        // When the summaries are merged into the single modal for the selection
        // Then the flag must survive, otherwise the warning would disappear in bulk submit
        expect(mergeReportSubmitViolationSummaries(summaries).hasMissingAmount).toBe(true);
    });

    it('leaves the missing merchant and amount flags off when no selected report has them', () => {
        // Given a bulk submit of clean reports
        const summaries = [createEmptySummary(), createEmptySummary()];

        // When the summaries are merged
        const merged = mergeReportSubmitViolationSummaries(summaries);

        // Then both flags must stay false, so a clean bulk submit doesn't open the modal
        expect(merged.hasMissingMerchant).toBe(false);
        expect(merged.hasMissingAmount).toBe(false);
    });
});

describe('buildSubmitViolationBullets', () => {
    it('returns an empty list when there is nothing to report', () => {
        // Given a summary where every bucket is empty
        const summary = createEmptySummary();

        // When the bullets are built
        // Then there is nothing for the modal to show, so the list must be empty
        expect(buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString})).toEqual([]);
    });

    it('orders bullets: other violations first, then a missing merchant and amount, then report rejection, then expense rejection, then pending-card-match', () => {
        // Given a summary with every kind of violation present at once
        const summary = {
            hasRejectedExpense: true,
            hasReportBeenRejected: true,
            hasPendingCardMatch: true,
            hasMissingMerchant: true,
            hasMissingAmount: true,
            otherViolations: new Map([[CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, createMockViolation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)]]),
        };

        // When the bullets are built
        const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

        // Then the order must be stable so the modal copy doesn't shuffle between renders, and the other-violation
        // bullet must use the full violation message (with the interpolated amount), not the short label
        expect(bullets).toEqual([
            'violations.overCategoryLimit(0 USD)',
            'iou.missingMerchant',
            'iou.missingAmount',
            'iou.confirmSubmitReportViolations.reportRejected',
            'iou.confirmSubmitReportViolations.rejectedExpense',
            'iou.confirmSubmitReportViolations.pendingCardMatch',
        ]);
    });

    it('builds the full receipt-required message with the formatted threshold amount, not the short label', () => {
        // Given a receipt-required violation whose data carries the policy's no-receipt amount threshold (e.g. $25)
        const receiptRequiredViolation = createMockViolation(CONST.VIOLATIONS.RECEIPT_REQUIRED, {amount: 2500, currency: 'USD'});
        const summary = {
            ...createEmptySummary(),
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

    it('strips HTML from a violation translation, since the modal renders bullets as plain text', () => {
        // Given a violation whose translation includes an HTML link - a broken-connection RTER message for an admin
        // is a real example: this call site doesn't have the company-card page URL needed to build a working link,
        // so the real translation renders one with an "undefined" href if the markup isn't stripped
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the test double to the wider LocaleContextProps['translate'] signature the function under test expects
        const htmlTranslate = jest.fn(() => 'Bank connection broken. <a href="undefined">Reconnect to match receipt</a>') as unknown as LocaleContextProps['translate'];
        const rterViolation = createMockViolation(CONST.VIOLATIONS.RTER, {brokenBankConnection: true, isAdmin: true});
        const summary = {
            ...createEmptySummary(),
            otherViolations: new Map([[CONST.VIOLATIONS.RTER, rterViolation]]),
        };

        // When the bullets are built
        const bullets = buildSubmitViolationBullets({summary, translate: htmlTranslate, dateFnsLocale, convertToDisplayString});

        // Then the bullet must be plain text with no HTML tags, since SubmitViolationsList has no HTML renderer and
        // would otherwise show the raw markup (including the broken "undefined" href) to the user
        expect(bullets.at(0)).not.toContain('<a');
        expect(bullets.at(0)).not.toContain('href=');
    });
});
