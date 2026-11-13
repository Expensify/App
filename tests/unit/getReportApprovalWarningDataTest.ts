import getReportApprovalWarningData from '@libs/Violations/getReportApprovalWarningData';
import getReportApproveViolationSummary from '@libs/Violations/getReportApproveViolationSummary';
import {hasAnySubmitViolation} from '@libs/Violations/getReportSubmitViolationSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';

import createMock from '../utils/createMock';

const REPORT_ID = '1001';
const APPROVER_EMAIL = 'approver@example.com';
const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1` as const;
const transaction = createMock<Transaction>({transactionID: '1', reportID: REPORT_ID, merchant: 'Merchant', amount: 1000, currency: 'USD'});
const violation: TransactionViolation = {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING};

describe('getReportApprovalWarningData', () => {
    it('warns about a snapshot-only report that has never been opened', () => {
        // Given a Search transaction and violation that have not hydrated into live Onyx
        const snapshotViolations = {[violationKey]: [violation]};

        // When approval resolves warning data from the snapshot
        const data = getReportApprovalWarningData(REPORT_ID, [transaction], [], snapshotViolations, {});
        const summary = getReportApproveViolationSummary(data.transactions, data.violations, undefined, undefined, APPROVER_EMAIL, 1);

        // Then the report still requires confirmation
        expect(summary.otherViolations.get(violation.name)).toBe(violation);
        expect(hasAnySubmitViolation(summary)).toBe(true);
        expect(snapshotViolations[violationKey]).toEqual([violation]);
    });

    it('keeps snapshot siblings while preferring live transactions by ID', () => {
        // Given a report with one updated live expense and another snapshot-only expense
        const sibling = {...transaction, transactionID: '2'};
        const liveTransaction = {...transaction, amount: 2000};

        // When both transaction sources are resolved
        const data = getReportApprovalWarningData(REPORT_ID, [transaction, sibling], [liveTransaction], {}, {});

        // Then there are no duplicates and no missing snapshot-only siblings
        expect(data.transactions).toEqual([liveTransaction, sibling]);
        expect(transaction.amount).toBe(1000);
    });

    it('does not resurrect snapshot violations after a live clear', () => {
        // Given an authoritative live clear and a stale snapshot warning
        const snapshotViolations = {[violationKey]: [violation]};

        // When a live empty array is present
        const data = getReportApprovalWarningData(REPORT_ID, [transaction], [], snapshotViolations, {[violationKey]: []});

        // Then the snapshot warning stays cleared
        expect(data.violations?.[violationKey]).toEqual([]);
        expect(hasAnySubmitViolation(getReportApproveViolationSummary(data.transactions, data.violations, undefined, undefined, '', 1))).toBe(false);
    });

    it('falls back when the live selector creates an undefined entry', () => {
        // Given a selected key without a loaded live violation record
        const snapshotViolations = {[violationKey]: [violation]};

        // When the selector contains the key with an undefined value
        const data = getReportApprovalWarningData(REPORT_ID, [transaction], [], snapshotViolations, {[violationKey]: undefined});

        // Then key presence alone does not erase snapshot warnings
        expect(data.violations?.[violationKey]).toEqual([violation]);
    });

    it('scopes both transactions and violations to the approved report', () => {
        // Given snapshot data containing an expense for another report
        const otherTransaction = {...transaction, transactionID: '2', reportID: 'other-report'};
        const otherKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}2` as const;

        // When this report's warning data is resolved
        const data = getReportApprovalWarningData(REPORT_ID, [transaction, otherTransaction], [], {[otherKey]: [violation]}, {});

        // Then another report cannot contribute warnings
        expect(data.transactions).toEqual([transaction]);
        expect(data.violations?.[otherKey]).toBeUndefined();
    });

    it('preserves dismissal and full versus partial approval rules for snapshot data', () => {
        // Given a dismissed expense and a held expense with the same violation
        const dismissed = {...transaction, comment: {dismissedViolations: {[violation.name]: {[APPROVER_EMAIL]: '2026-11-13 00:00:00'}}}};
        const held = {...transaction, transactionID: '2', comment: {hold: 'hold-action'}};
        const otherKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}2` as const;

        // When warning data is resolved for full and partial approval
        const data = getReportApprovalWarningData(REPORT_ID, [dismissed, held], [], {[violationKey]: [violation], [otherKey]: [violation]}, {});
        const full = getReportApproveViolationSummary(data.transactions, data.violations, undefined, undefined, APPROVER_EMAIL, 1, true);
        const partial = getReportApproveViolationSummary(data.transactions, data.violations, undefined, undefined, APPROVER_EMAIL, 1, false);

        // Then only full approval warns about the held expense; the approver's dismissal still applies
        expect(hasAnySubmitViolation(full)).toBe(true);
        expect(hasAnySubmitViolation(partial)).toBe(false);
    });
});
