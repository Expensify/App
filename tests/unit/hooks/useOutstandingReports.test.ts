import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';
const ACCOUNT_ID = 100;

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
        id: POLICY_ID,
        pendingAction: undefined,
        ...overrides,
    };
}

function buildExpenseReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        reportName: `Report ${reportID}`,
        ...overrides,
    };
}

function buildTransaction(transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(0),
        transactionID,
        reportID,
        ...overrides,
    };
}

async function setupOnyxData(policy: Policy, reports: Report[], transactions: Transaction[]) {
    await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

    const reportDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, reports, (report) => report?.reportID);
    await Onyx.multiSet(reportDataSet);

    const transactionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, transactions, (txn) => txn?.transactionID);
    await Onyx.multiSet(transactionDataSet);

    await waitForBatchedUpdates();
}

describe('useOutstandingReports', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it('returns reports when policy does not have instant submit with no approvers', async () => {
        // Given a workspace without instant submit and a report containing a non-reimbursable expense
        await act(async () => {
            await setupOnyxData(buildPolicy({autoReporting: false}), [buildExpenseReport('report1')], [buildTransaction('txn1', 'report1', {reimbursable: false})]);
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the report should be included because the policy doesn't trigger the ineligibility filter
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('report1');
        });
    });

    it('filters out reports with only non-reimbursable transactions when policy has instant submit and submit & close', async () => {
        // Given a workspace with instant submit and no approvers, and a report containing only non-reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildPolicy({
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }),
                [buildExpenseReport('report1')],
                [buildTransaction('txn1', 'report1', {reimbursable: false})],
            );
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the report should be excluded because moving expenses to it would fail server-side with a 403
        await waitFor(() => {
            expect(result.current.length).toBe(0);
        });
    });

    it('keeps reports with reimbursable transactions even with instant submit and submit & close', async () => {
        // Given a workspace with instant submit and no approvers, but a report that has reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildPolicy({
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }),
                [buildExpenseReport('report1')],
                [buildTransaction('txn1', 'report1', {reimbursable: true})],
            );
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the report should be included because it contains reimbursable transactions that keep the report open
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('report1');
        });
    });

    it('returns empty array when all reports are ineligible', async () => {
        // Given a workspace with instant submit and no approvers, where every report has only non-reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildPolicy({
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }),
                [buildExpenseReport('report1'), buildExpenseReport('report2')],
                [buildTransaction('txn1', 'report1', {reimbursable: false}), buildTransaction('txn2', 'report2', {reimbursable: false})],
            );
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then no reports should be returned, which allows the confirmation page to disable the Report field instead of opening a blank page
        await waitFor(() => {
            expect(result.current.length).toBe(0);
        });
    });

    it('filters only ineligible reports and keeps eligible ones', async () => {
        // Given a workspace with instant submit and no approvers, one report with only non-reimbursable expenses and another with reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildPolicy({
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }),
                [buildExpenseReport('reportIneligible'), buildExpenseReport('reportEligible')],
                [buildTransaction('txnIneligible', 'reportIneligible', {reimbursable: false}), buildTransaction('txnEligible', 'reportEligible', {reimbursable: true})],
            );
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then only the eligible report should remain since the ineligible one would cause a 403 if expenses were moved to it
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('reportEligible');
        });
    });
});
