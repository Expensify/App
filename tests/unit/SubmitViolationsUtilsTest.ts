import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxCollection} from 'react-native-onyx';

import type {Report, Transaction} from '../../src/types/onyx';
import type {TransactionViolation} from '../../src/types/onyx/TransactionViolation';

import * as SubmitViolationsUtils from '../../src/libs/SubmitViolationsUtils';
import createMock from '../utils/createMock';

describe('SubmitViolationsUtils', () => {
    describe('getSubmitViolationsSummary', () => {
        const REPORT_OWNER_LOGIN = 'owner@test.com';
        const SUBMITTER_EMAIL = 'submitter@test.com';
        const SUBMITTER_ACCOUNT_ID = 1;

        function buildViolationsCollection(byTransactionID: Record<string, TransactionViolation[]>): OnyxCollection<TransactionViolation[]> {
            const collection: OnyxCollection<TransactionViolation[]> = {};
            for (const [transactionID, violations] of Object.entries(byTransactionID)) {
                collection[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] = violations;
            }
            return collection;
        }

        it('returns all-false/empty when there are no violations', () => {
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], {}, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary).toEqual({hasSevenDayHoldViolation: false, hasGenericPendingRTERViolation: false, hasRejectedViolation: false, hasReportBeenRejected: false, otherViolations: []});
        });

        it('flags hasSevenDayHoldViolation for a seven-day-hold RTER violation and does not double-count it as generic pending', () => {
            // The backend sends RTER violations as type "warning" (confirmed against real Onyx data captured while
            // testing #101213 live), not "violation". Using WARNING here guards against re-introducing a type
            // filter that would silently stop matching real seven-day-hold violations.
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({
                t1: [{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.RTER, data: {pendingPattern: true, rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD}}],
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasSevenDayHoldViolation).toBe(true);
            expect(summary.hasGenericPendingRTERViolation).toBe(false);
        });

        it('flags hasGenericPendingRTERViolation for a plain (non-seven-day) pending RTER violation, preserving the pre-#101213 mark-as-cash resolution', () => {
            // Real RTER violations are type "warning", not "violation". See note above. This case predates #101213
            // (it's the same "receipt pending match with card" flow that useConfirmPendingRTERAndProceed handled
            // before this ticket) and must keep its existing mark-as-cash resolution, not fall into the "no action"
            // otherViolations bucket alongside genuinely unfixable violations like over-category-limit.
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({t1: [{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.RTER, data: {pendingPattern: true}}]});
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasGenericPendingRTERViolation).toBe(true);
            expect(summary.hasSevenDayHoldViolation).toBe(false);
            expect(summary.otherViolations).toEqual([]);
        });

        it('flags hasRejectedViolation for an AUTO_REPORTED_REJECTED_EXPENSE violation', () => {
            // The backend sends this violation as type "warning" too (confirmed against real Onyx data), matching
            // the fixture already used in RejectMoneyRequestTest.ts for the same violation name.
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({
                t1: [{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, data: {rejectedBy: 'approver@test.com', rejectReason: 'Missing receipt'}}],
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasRejectedViolation).toBe(true);
        });

        it('flags hasReportBeenRejected when the whole report was rejected back to the submitter, even though the transaction itself has no violations', () => {
            // A separate mechanism from AUTO_REPORTED_REJECTED_EXPENSE (rejecting a single expense): rejecting the
            // whole report (RejectMoneyRequest.ts's rejectExpenseReport) writes no TransactionViolation at all.
            // Confirmed against real Onyx data captured while testing #101213 live. It only sets the report's own
            // stateNum/nextStep fields.
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const report = createMock<Report>({
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], {}, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, report, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasReportBeenRejected).toBe(true);
        });

        it('does not flag hasReportBeenRejected once the report has moved past the OPEN state (e.g. resubmitted)', () => {
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const report = createMock<Report>({
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], {}, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, report, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasReportBeenRejected).toBe(false);
        });

        it('flags both hasRejectedViolation and a real other violation together on the same warning/violation-mixed transaction, matching real backend data', () => {
            // Regression test for the exact shape captured from a live Onyx dump: a transaction with both a
            // type:"violation" missingCategory violation and a type:"warning" autoReportedRejectedExpense violation.
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({
                t1: [
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, showInReview: true, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {
                        data: {rejectedBy: 'mrtrue955+exp54@gmail.com', rejectReason: 'Testing per-expense rejection'},
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        showInReview: true,
                        type: CONST.VIOLATION_TYPES.WARNING,
                    },
                ],
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary.hasRejectedViolation).toBe(true);
            expect(summary.otherViolations.map((violation) => violation.name)).toEqual([CONST.VIOLATIONS.MISSING_CATEGORY]);
        });

        it('collects any other violation of type VIOLATION into otherViolations, deduped by name', () => {
            const transactionA = createMock<Transaction>({transactionID: 't1'});
            const transactionB = createMock<Transaction>({transactionID: 't2'});
            const violations = buildViolationsCollection({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                t2: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary(
                [transactionA, transactionB],
                violations,
                SUBMITTER_EMAIL,
                SUBMITTER_ACCOUNT_ID,
                undefined,
                REPORT_OWNER_LOGIN,
                undefined,
            );
            expect(summary.otherViolations).toEqual([{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}]);
        });

        it('excludes violations that are not of type VIOLATION (e.g. warnings)', () => {
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({t1: [{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.SMARTSCAN_FAILED}]});
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary).toEqual({hasSevenDayHoldViolation: false, hasGenericPendingRTERViolation: false, hasRejectedViolation: false, hasReportBeenRejected: false, otherViolations: []});
        });

        it('excludes a HOLD violation entirely, since submitReport already splits held expenses onto a separate report', () => {
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.HOLD}]});
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary).toEqual({hasSevenDayHoldViolation: false, hasGenericPendingRTERViolation: false, hasRejectedViolation: false, hasReportBeenRejected: false, otherViolations: []});
        });

        it('excludes a broken-card-connection RTER violation entirely, since it has dedicated UI elsewhere', () => {
            const transaction = createMock<Transaction>({transactionID: 't1'});
            const violations = buildViolationsCollection({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}],
            });
            const summary = SubmitViolationsUtils.getSubmitViolationsSummary([transaction], violations, SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, undefined, REPORT_OWNER_LOGIN, undefined);
            expect(summary).toEqual({hasSevenDayHoldViolation: false, hasGenericPendingRTERViolation: false, hasRejectedViolation: false, hasReportBeenRejected: false, otherViolations: []});
        });
    });

    describe('hasAnySubmitViolation', () => {
        it('is true when hasSevenDayHoldViolation is the only flag set', () => {
            expect(
                SubmitViolationsUtils.hasAnySubmitViolation({
                    hasSevenDayHoldViolation: true,
                    hasGenericPendingRTERViolation: false,
                    hasRejectedViolation: false,
                    hasReportBeenRejected: false,
                    otherViolations: [],
                }),
            ).toBe(true);
        });

        it('is false when only hasGenericPendingRTERViolation is set, since that case predates #101213 and keeps its own standalone flow', () => {
            expect(
                SubmitViolationsUtils.hasAnySubmitViolation({
                    hasSevenDayHoldViolation: false,
                    hasGenericPendingRTERViolation: true,
                    hasRejectedViolation: false,
                    hasReportBeenRejected: false,
                    otherViolations: [],
                }),
            ).toBe(false);
        });

        it('is false when nothing is set', () => {
            expect(
                SubmitViolationsUtils.hasAnySubmitViolation({
                    hasSevenDayHoldViolation: false,
                    hasGenericPendingRTERViolation: false,
                    hasRejectedViolation: false,
                    hasReportBeenRejected: false,
                    otherViolations: [],
                }),
            ).toBe(false);
        });
    });

    describe('hasTransactionBeenRejected', () => {
        it('returns true when the violations include AUTO_REPORTED_REJECTED_EXPENSE', () => {
            expect(SubmitViolationsUtils.hasTransactionBeenRejected([{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE}])).toBe(true);
        });

        it('returns false when the violations do not include AUTO_REPORTED_REJECTED_EXPENSE', () => {
            expect(SubmitViolationsUtils.hasTransactionBeenRejected([{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}])).toBe(false);
        });

        it('returns false when there are no violations', () => {
            expect(SubmitViolationsUtils.hasTransactionBeenRejected(undefined)).toBe(false);
        });
    });
});
