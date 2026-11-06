import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, SearchResults, Transaction} from '@src/types/onyx';

import {
    areAllTransactionsExpenseCompatible,
    getBulkEditCategoryChange,
    getBulkEditTaxCodeChange,
    getTransactionEditContext,
    hasCustomUnitMerchantInSelection,
    isBulkEditNegativeAmountAllowed,
    isBulkEditTaxTrackingEnabled,
    withSnapshotReports,
    withSnapshotTransactions,
} from '../../src/pages/Search/SearchEditMultiple/SearchEditMultipleUtils';
import createMock from '../utils/createMock';

const POLICY_A = 'policyA';
const POLICY_B = 'policyB';
const POLICY_C = 'policyC';
const REPORT_ID = 'report1';
const TRANSACTION_ID_1 = 'tx1';
const TRANSACTION_ID_2 = 'tx2';
const TRANSACTION_ID_3 = 'tx3';
const TRANSACTION_DATA_KEY_1: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`;
const REPORT_DATA_KEY: `${typeof ONYXKEYS.COLLECTION.REPORT}${string}` = `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`;

function makeTransaction(transactionID: string, reportID: string): Transaction {
    return createMock<Transaction>({
        transactionID,
        reportID,
        amount: 100,
        currency: 'USD',
        created: '2025-01-01',
        comment: {},
    });
}

function makeReport(reportID: string, policyID: string): Report {
    return createMock<Report>({reportID, policyID, type: 'expense'});
}

describe('SearchEditMultipleUtils', () => {
    describe('withSnapshotTransactions', () => {
        it('fills missing transactions from snapshot', () => {
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[TRANSACTION_DATA_KEY_1] = makeTransaction(TRANSACTION_ID_1, REPORT_ID);

            const merged = withSnapshotTransactions(undefined, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]?.transactionID).toBe(TRANSACTION_ID_1);
        });

        it('does not overwrite existing transactions', () => {
            const existing = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID_1}`]: makeTransaction(TRANSACTION_ID_1, 'existingReport'),
            };
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[TRANSACTION_DATA_KEY_1] = makeTransaction(TRANSACTION_ID_1, 'snapshotReport');

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
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[REPORT_DATA_KEY] = makeReport(REPORT_ID, POLICY_A);

            const merged = withSnapshotReports(undefined, snapshotData);

            expect(merged?.[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]?.policyID).toBe(POLICY_A);
        });

        it('does not overwrite existing reports', () => {
            const existing = {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeReport(REPORT_ID, POLICY_A),
            };
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[REPORT_DATA_KEY] = makeReport(REPORT_ID, POLICY_B);

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
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[REPORT_DATA_KEY] = makeReport(REPORT_ID, POLICY_A);

            // Without snapshot merge — falls back to activePolicyID
            const withoutMerge = getSearchBulkEditPolicyID([TRANSACTION_ID_1], POLICY_B, allTransactions, undefined);
            expect(withoutMerge).toBe(POLICY_B);

            // With snapshot merge — resolves to the correct policy
            const mergedReports = withSnapshotReports(undefined, snapshotData);
            const withMerge = getSearchBulkEditPolicyID([TRANSACTION_ID_1], POLICY_B, allTransactions, mergedReports);
            expect(withMerge).toBe(POLICY_A);
        });

        it('resolves policyID when transaction is only in snapshot', () => {
            const snapshotData = createMock<SearchResults['data']>({});
            snapshotData[TRANSACTION_DATA_KEY_1] = makeTransaction(TRANSACTION_ID_1, REPORT_ID);
            snapshotData[REPORT_DATA_KEY] = makeReport(REPORT_ID, POLICY_A);

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

    describe('hasCustomUnitMerchantInSelection', () => {
        const manualTransaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID_1,
            reportID: 'report1',
            comment: {},
        });
        const perDiemTransaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID_2,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
        });
        const distanceTransaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID_3,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
        });

        it('returns true when any transaction is an unreported per-diem request', () => {
            const contexts = [{transaction: manualTransaction}, {transaction: perDiemTransaction}];
            expect(hasCustomUnitMerchantInSelection(contexts)).toBe(true);
        });

        it('returns true when any transaction is a distance request', () => {
            const contexts = [{transaction: manualTransaction}, {transaction: distanceTransaction}];
            expect(hasCustomUnitMerchantInSelection(contexts)).toBe(true);
        });

        it('returns false when no transaction is a distance or per-diem request', () => {
            const contexts = [{transaction: manualTransaction}];
            expect(hasCustomUnitMerchantInSelection(contexts)).toBe(false);
        });

        it('returns false for an empty selection', () => {
            expect(hasCustomUnitMerchantInSelection([])).toBe(false);
        });
    });

    describe('areAllTransactionsExpenseCompatible', () => {
        const expenseReport = createMock<Report>({reportID: 'expenseReport1', type: CONST.REPORT.TYPE.EXPENSE});
        const iouReport = createMock<Report>({reportID: 'iouReport1', type: CONST.REPORT.TYPE.IOU});
        const invoiceReport = createMock<Report>({reportID: 'invoiceReport1', type: CONST.REPORT.TYPE.INVOICE});

        it('returns true when every reported transaction is on an expense report', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, 'expenseReport1'), report: expenseReport},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'expenseReport1'), report: expenseReport},
            ];
            expect(areAllTransactionsExpenseCompatible(contexts)).toBe(true);
        });

        it('returns true for unreported (track) transactions', () => {
            const contexts = [{transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), report: undefined}];
            expect(areAllTransactionsExpenseCompatible(contexts)).toBe(true);
        });

        it('returns false when any reported transaction is on an IOU report', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, 'expenseReport1'), report: expenseReport},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'iouReport1'), report: iouReport},
            ];
            expect(areAllTransactionsExpenseCompatible(contexts)).toBe(false);
        });

        it('returns false when a mix of unreported and IOU transactions is selected', () => {
            const contexts = [
                {transaction: makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID), report: undefined},
                {transaction: makeTransaction(TRANSACTION_ID_2, 'iouReport1'), report: iouReport},
            ];
            expect(areAllTransactionsExpenseCompatible(contexts)).toBe(false);
        });

        it('returns true for invoice reports (not IOU)', () => {
            const contexts = [{transaction: makeTransaction(TRANSACTION_ID_1, 'invoiceReport1'), report: invoiceReport}];
            expect(areAllTransactionsExpenseCompatible(contexts)).toBe(true);
        });

        it('returns true for an empty selection', () => {
            expect(areAllTransactionsExpenseCompatible([])).toBe(true);
        });
    });

    describe('isBulkEditTaxTrackingEnabled', () => {
        const taxEnabledPolicy = createMock<Policy>({id: POLICY_A, tax: {trackingEnabled: true}});
        const taxDisabledPolicy = createMock<Policy>({id: POLICY_B, tax: {trackingEnabled: false}});
        const activeTaxEnabledPolicy = createMock<Policy>({id: POLICY_C, tax: {trackingEnabled: true}});

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

    describe('getTransactionEditContext', () => {
        it('returns the report actions of the transaction report so callers can reuse them without re-indexing the collection', () => {
            const transaction = makeTransaction(TRANSACTION_ID_1, REPORT_ID);
            const iouAction = createMock<ReportAction>({
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {IOUTransactionID: TRANSACTION_ID_1, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
            });
            const reportActionsForReport = {[iouAction.reportActionID]: iouAction};

            const allTransactions = {[TRANSACTION_DATA_KEY_1]: transaction};
            const allReports = {[REPORT_DATA_KEY]: makeReport(REPORT_ID, POLICY_A)};
            const allReportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`]: reportActionsForReport};

            const context = getTransactionEditContext(TRANSACTION_ID_1, allTransactions, allReports, allReportActions, undefined);

            expect(context?.reportActions).toEqual(reportActionsForReport);
            expect(context?.reportAction).toEqual(iouAction);
        });

        it('returns null when the transaction is not found', () => {
            expect(getTransactionEditContext('missing', {}, {}, {}, undefined)).toBeNull();
        });
    });

    describe('getBulkEditCategoryChange', () => {
        it('records a newly picked category', () => {
            // Given no category picked yet
            // When Food is picked
            // Then the draft records it
            expect(getBulkEditCategoryChange('Food', '')).toEqual({category: 'Food'});
        });

        it('drops the pending change when the picked category is picked again, or nothing is picked', () => {
            // Given Food is already picked
            // When Food is picked again, or the list hands back an empty pick
            // Then the pending change is cleared rather than re-recorded
            expect(getBulkEditCategoryChange('Food', 'Food')).toEqual({category: null});
            expect(getBulkEditCategoryChange('', 'Food')).toEqual({category: null});
        });
    });

    describe('getBulkEditTaxCodeChange', () => {
        it('records a newly picked rate and drops the pending change when it is picked again', () => {
            // Given no rate picked yet, then one picked
            // When a rate is picked, then picked again
            // Then the first pick is recorded and the second clears it
            expect(getBulkEditTaxCodeChange('id_TAX_1', '')).toEqual({taxCode: 'id_TAX_1'});
            expect(getBulkEditTaxCodeChange('id_TAX_1', 'id_TAX_1')).toEqual({taxCode: null});
        });
    });

    describe('isBulkEditNegativeAmountAllowed', () => {
        const THREAD_REPORT_ID = 'thread1';
        const unreportedTransaction = makeTransaction(TRANSACTION_ID_1, CONST.REPORT.UNREPORTED_REPORT_ID);
        const reportedTransaction = makeTransaction(TRANSACTION_ID_2, REPORT_ID);
        const expenseReport = makeReport(REPORT_ID, POLICY_A);
        const policy = createMock<Policy>({id: POLICY_A, type: CONST.POLICY.TYPE.TEAM});
        const reports = {[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: expenseReport};
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A}`]: policy};

        it('allows a negative amount for unreported expenses', () => {
            // Given only unreported expenses, which can always go negative
            // When the selection is checked
            // Then the amount field may flip negative
            expect(isBulkEditNegativeAmountAllowed([{transaction: unreportedTransaction, report: undefined}], reports, policies)).toBe(true);
        });

        it('follows the report and workspace of a reported expense', () => {
            // Given a reported expense on a workspace that allows negative expense amounts
            // When the selection is checked
            // Then the amount field follows that workspace, and a missing report rules it out
            expect(isBulkEditNegativeAmountAllowed([{transaction: reportedTransaction, report: expenseReport}], reports, policies)).toBe(true);
            expect(isBulkEditNegativeAmountAllowed([{transaction: reportedTransaction, report: undefined}], reports, policies)).toBe(false);
        });

        it('follows the money request report a chat report belongs to', () => {
            // Given an expense whose report is a chat that hangs off an expense report
            const threadReport = createMock<Report>({reportID: THREAD_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: REPORT_ID});
            const threadTransaction = makeTransaction(TRANSACTION_ID_3, THREAD_REPORT_ID);

            // When the selection is checked
            // Then the expense report decides, as a chat on its own never allows a negative amount
            expect(isBulkEditNegativeAmountAllowed([{transaction: threadTransaction, report: threadReport}], reports, policies)).toBe(true);
            expect(isBulkEditNegativeAmountAllowed([{transaction: threadTransaction, report: threadReport}], {}, policies)).toBe(false);
        });

        it('rules out a negative amount for an empty selection', () => {
            // Given nothing selected
            // When the selection is checked
            // Then there is nothing to flip
            expect(isBulkEditNegativeAmountAllowed([], reports, policies)).toBe(false);
        });
    });
});
