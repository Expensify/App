import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import {isBulkEditTaxTrackingEnabled, withSnapshotReports, withSnapshotTransactions} from '../../src/pages/Search/SearchEditMultiple/SearchEditMultipleUtils';

const POLICY_A = 'policyA';
const POLICY_B = 'policyB';
const POLICY_C = 'policyC';
const REPORT_ID = 'report1';
const TRANSACTION_ID_1 = 'tx1';
const TRANSACTION_ID_2 = 'tx2';

function makeTransaction(transactionID: string, reportID: string): Transaction {
    return {transactionID, reportID, amount: 100, currency: 'USD', created: '2025-01-01', comment: {}} as Transaction;
}

function makeReport(reportID: string, policyID: string): Report {
    return {reportID, policyID, type: 'expense'} as unknown as Report;
}

describe('SearchEditMultipleUtils', () => {
    describe('withSnapshotTransactions', () => {
        it('fills missing transactions from snapshot', () => {
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, REPORT_ID),
            } as unknown as SearchResults['data'];

            const merged = withSnapshotTransactions(undefined, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]?.transactionID).toBe(TRANSACTION_ID_1);
        });

        it('does not overwrite existing transactions', () => {
            const existing = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, 'existingReport'),
            };
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, 'snapshotReport'),
            } as unknown as SearchResults['data'];

            const merged = withSnapshotTransactions(existing, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]?.reportID).toBe('existingReport');
        });

        it('returns original when no snapshot', () => {
            const existing = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, REPORT_ID),
            };

            const merged = withSnapshotTransactions(existing, undefined);

            expect(merged).toBe(existing);
        });
    });

    describe('withSnapshotReports', () => {
        it('fills missing reports from snapshot', () => {
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_A),
            } as unknown as SearchResults['data'];

            const merged = withSnapshotReports(undefined, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]?.policyID).toBe(POLICY_A);
        });

        it('does not overwrite existing reports', () => {
            const existing = {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_A),
            };
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_B),
            } as unknown as SearchResults['data'];

            const merged = withSnapshotReports(existing, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]?.policyID).toBe(POLICY_A);
        });
    });

    describe('getSearchBulkEditPolicyID with snapshot-merged data', () => {
        it('resolves policyID when report is only in snapshot', () => {
            // Transaction exists in Onyx, but its report only exists in the snapshot
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, REPORT_ID),
            };
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_A),
            } as unknown as SearchResults['data'];

            // Without snapshot merge — falls back to activePolicyID
            const withoutMerge = getSearchBulkEditPolicyID([TRANSACTION_ID_1], POLICY_B, allTransactions, undefined);
            expect(withoutMerge).toBe(POLICY_B);

            // With snapshot merge — resolves to the correct policy
            const mergedReports = withSnapshotReports(undefined, snapshotData);
            const withMerge = getSearchBulkEditPolicyID([TRANSACTION_ID_1], POLICY_B, allTransactions, mergedReports);
            expect(withMerge).toBe(POLICY_A);
        });

        it('resolves policyID when transaction is only in snapshot', () => {
            const snapshotData = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, REPORT_ID),
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_A),
            } as unknown as SearchResults['data'];

            const mergedTransactions = withSnapshotTransactions(undefined, snapshotData);
            const mergedReports = withSnapshotReports(undefined, snapshotData);

            const result = getSearchBulkEditPolicyID([TRANSACTION_ID_1], POLICY_B, mergedTransactions, mergedReports);
            expect(result).toBe(POLICY_A);
        });

        it('falls back to activePolicyID when transactions span multiple policies', () => {
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, 'reportA'),
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_2}`]: makeTransaction(TRANSACTION_ID_2, 'reportB'),
            };
            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}reportA`]: makeReport('reportA', POLICY_A),
                [`${ONYXKEYS.COLLECTION.REPORT}reportB`]: makeReport('reportB', POLICY_B),
            };

            const result = getSearchBulkEditPolicyID([TRANSACTION_ID_1, TRANSACTION_ID_2], 'fallback', allTransactions, allReports);
            expect(result).toBe('fallback');
        });

        it('returns activePolicyID when no transactions selected', () => {
            const result = getSearchBulkEditPolicyID([], POLICY_A, undefined, undefined);
            expect(result).toBe(POLICY_A);
        });
    });

    describe('isBulkEditTaxTrackingEnabled', () => {
        const taxEnabledPolicy = {id: POLICY_A, tax: {trackingEnabled: true}} as unknown as Policy;
        const taxDisabledPolicy = {id: POLICY_B, tax: {trackingEnabled: false}} as unknown as Policy;
        const activeTaxEnabledPolicy = {id: POLICY_C, tax: {trackingEnabled: true}} as unknown as Policy;

        it('returns true when all transactions are unreported and the bulk-edit workspace has tax enabled', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
                {transaction: makeTransaction(TRANSACTION_ID_2, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxEnabledPolicy, false)).toBe(true);
        });

        it('returns false when all transactions are unreported and the bulk-edit workspace has tax disabled', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
                {transaction: makeTransaction(TRANSACTION_ID_2, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxDisabledPolicy, false)).toBe(false);
        });

        it('returns true when reported transactions all share a tax-enabled policy', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, 'report1'), transactionPolicy: taxEnabledPolicy},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'report2'), transactionPolicy: taxEnabledPolicy},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxEnabledPolicy, false)).toBe(true);
        });

        it('returns false for cross-policy selection when one reported transaction is in a tax-disabled workspace', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, 'report1'), transactionPolicy: taxEnabledPolicy},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'report2'), transactionPolicy: taxDisabledPolicy},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, activeTaxEnabledPolicy, false)).toBe(false);
        });

        it('returns true for a mix of unreported and tax-enabled reported transactions', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'report1'), transactionPolicy: taxEnabledPolicy},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxEnabledPolicy, false)).toBe(true);
        });

        it('returns false when a tax-disabled reported transaction is mixed with unreported transactions', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), transactionPolicy: undefined},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'report1'), transactionPolicy: taxDisabledPolicy},
            ];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxEnabledPolicy, false)).toBe(false);
        });

        it('returns false when the selection contains per-diem or time transactions, regardless of policy', () => {
            const contexts = [{transaction: makeTransaction(TRANSACTION_ID_1, 'report1'), transactionPolicy: taxEnabledPolicy}];
            expect(isBulkEditTaxTrackingEnabled(contexts, taxEnabledPolicy, true)).toBe(false);
        });
    });
});
