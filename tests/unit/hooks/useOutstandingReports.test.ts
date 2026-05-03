import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';
const SECOND_POLICY_ID = 'policy2';
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

function buildInstantSubmitNoApproversPolicy(overrides: Partial<Policy> = {}): Policy {
    return buildPolicy({
        autoReporting: true,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        ...overrides,
    });
}

async function setupOnyxData(policy: Policy, reports: Report[], transactions: Array<{transactionID: string; reportID: string; reimbursable: boolean}>) {
    await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

    for (const report of reports) {
        // eslint-disable-next-line no-await-in-loop -- Onyx writes during test setup must be sequential so derived values (e.g. OUTSTANDING_REPORTS_BY_POLICY_ID) settle in the expected order before the hook subscribes
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    }

    for (const txn of transactions) {
        // eslint-disable-next-line no-await-in-loop -- Onyx writes during test setup must be sequential so transaction-driven derived values resolve deterministically before assertions run
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txn.transactionID}`, txn);
    }

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
            await setupOnyxData(buildPolicy({autoReporting: false}), [buildExpenseReport('report1')], [{transactionID: 'txn1', reportID: 'report1', reimbursable: false}]);
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
            await setupOnyxData(buildInstantSubmitNoApproversPolicy(), [buildExpenseReport('report1')], [{transactionID: 'txn1', reportID: 'report1', reimbursable: false}]);
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the report should be excluded because moving expenses to it would fail server-side with a 403 (issue #70423)
        await waitFor(() => {
            expect(result.current.length).toBe(0);
        });
    });

    it('keeps reports with reimbursable transactions even with instant submit and submit & close', async () => {
        // Given a workspace with instant submit and no approvers, but a report that has reimbursable expenses
        await act(async () => {
            await setupOnyxData(buildInstantSubmitNoApproversPolicy(), [buildExpenseReport('report1')], [{transactionID: 'txn1', reportID: 'report1', reimbursable: true}]);
        });

        // When the hook computes outstanding reports for that workspace
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the report should be included because it contains reimbursable transactions that keep the report open
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('report1');
        });
    });

    it('returns empty array when all reports are ineligible so the confirmation Report field can be disabled', async () => {
        // Given a workspace with instant submit and no approvers, where every report has only non-reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [buildExpenseReport('report1'), buildExpenseReport('report2')],
                [
                    {transactionID: 'txn1', reportID: 'report1', reimbursable: false},
                    {transactionID: 'txn2', reportID: 'report2', reimbursable: false},
                ],
            );
        });

        // When the hook computes outstanding reports for that workspace, with no selected report (the confirmation page case)
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then no reports should be returned. ReportField uses outstandingReports.length to decide whether the field is interactive,
        // so an empty list correctly disables the field instead of opening a blank picker (deploy blocker #81608)
        await waitFor(() => {
            expect(result.current.length).toBe(0);
        });
    });

    it('filters only ineligible reports and keeps eligible ones', async () => {
        // Given a workspace with instant submit and no approvers, one report with only non-reimbursable expenses and another with reimbursable expenses
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [buildExpenseReport('reportIneligible'), buildExpenseReport('reportEligible')],
                [
                    {transactionID: 'txnIneligible', reportID: 'reportIneligible', reimbursable: false},
                    {transactionID: 'txnEligible', reportID: 'reportEligible', reimbursable: true},
                ],
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

    // Regression test for deploy blocker https://github.com/Expensify/App/issues/88424.
    // The currently selected (source) report must always remain in the outstanding list. Otherwise
    // outstandingReports.length === 0 in IOURequestEditReportCommon, which makes
    // shouldShowNotFoundPage true and unmounts the SelectionList, hiding the "Remove from report"
    // footer that lives inside it.
    it('keeps the currently selected source report in the list even when it is otherwise ineligible', async () => {
        // Given a retracted report containing only a non-reimbursable expense on a workspace
        // with instant submit and no approvers — the same conditions that flag a destination as ineligible
        await act(async () => {
            await setupOnyxData(buildInstantSubmitNoApproversPolicy(), [buildExpenseReport('sourceReport')], [{transactionID: 'txnSource', reportID: 'sourceReport', reimbursable: false}]);
        });

        // When the picker is rendered with that report as the selected source
        const {result} = renderHook(() => useOutstandingReports('sourceReport', POLICY_ID, ACCOUNT_ID, true));

        // Then the source report must still be returned so the picker renders and the "Remove from report" footer remains accessible
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('sourceReport');
        });
    });

    it('still filters out an ineligible non-source report even when a different source report is selected', async () => {
        // Given a selected source report and another report that is ineligible as a destination
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [buildExpenseReport('sourceReport'), buildExpenseReport('ineligibleDestination')],
                [
                    {transactionID: 'txnSource', reportID: 'sourceReport', reimbursable: true},
                    {transactionID: 'txnIneligible', reportID: 'ineligibleDestination', reimbursable: false},
                ],
            );
        });

        // When the hook is invoked with sourceReport as the selected report
        const {result} = renderHook(() => useOutstandingReports('sourceReport', POLICY_ID, ACCOUNT_ID, true));

        // Then only the source remains; the ineligible destination is filtered out as before
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('sourceReport');
        });
    });

    // Regression test for deploy blocker https://github.com/Expensify/App/issues/88425.
    // When "Create report" runs, an optimistic empty report is written to Onyx with
    // pendingFields.createReport === ADD, then the transaction is moved to it on a deferred
    // microtask. During that gap, hasOnlyNonReimbursableTransactions flips from false (zero
    // transactions) to true (one non-reimbursable transaction) and would otherwise cause the
    // new report to be filtered out, making it appear briefly and then disappear from the picker.
    it('keeps optimistically created reports (pendingFields.createReport === ADD) in the list', async () => {
        // Given an optimistically created empty report on a workspace with instant submit and no approvers,
        // plus a non-reimbursable transaction that has just been associated with it
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [
                    buildExpenseReport('optimisticReport', {
                        pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    }),
                ],
                [{transactionID: 'txnOptimistic', reportID: 'optimisticReport', reimbursable: false}],
            );
        });

        // When the hook computes outstanding reports
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the optimistic report remains visible until the server confirms creation and clears pendingFields
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('optimisticReport');
        });
    });

    // The cross-policy branch is hit when no selectedPolicyID is provided (e.g. from a self-DM
    // or before a workspace is chosen), in which case the hook iterates every workspace policy.
    // This exercises the per-report policy lookup added for issue #70423 and guards against
    // regressions where a policy lookup keyed off the source policyID would mis-classify
    // reports that belong to a different workspace.
    it('filters per-policy when iterating across multiple workspaces with no selectedPolicyID', async () => {
        // Given two workspaces with different eligibility profiles
        // policy1: instant submit + no approvers → reports with only non-reimbursable transactions are ineligible destinations
        // policy2: instant submit + approver workflow → those same reports stay eligible
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [buildExpenseReport('reportOnIneligiblePolicy')],
                [{transactionID: 'txnIneligible', reportID: 'reportOnIneligiblePolicy', reimbursable: false}],
            );

            const policyWithApprovers = buildPolicy({
                id: SECOND_POLICY_ID,
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, policyWithApprovers);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}reportOnEligiblePolicy`, buildExpenseReport('reportOnEligiblePolicy', {policyID: SECOND_POLICY_ID}));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txnEligible`, {transactionID: 'txnEligible', reportID: 'reportOnEligiblePolicy', reimbursable: false});
            await waitForBatchedUpdates();
        });

        // When the hook is invoked without a selectedPolicyID (cross-policy iteration branch)
        const {result} = renderHook(() => useOutstandingReports(undefined, undefined, ACCOUNT_ID, false));

        // Then only the eligible-workspace report is returned. The hook must look up each report's
        // own policy when applying isReportIneligibleForMoveExpenses — using a single policy for
        // the whole list would either drop the eligible report or keep the ineligible one.
        await waitFor(() => {
            expect(result.current.length).toBe(1);
            expect(result.current.at(0)?.reportID).toBe('reportOnEligiblePolicy');
        });
    });

    // Regression test for the failed-create scenario raised on PR #89079. An optimistic report
    // can stay in Onyx with pendingFields.createReport === ADD even after the server rejects the
    // create — the API failure data only sets errorFields.createReport, it does not clear the
    // pending field. Without this guard the report would remain in the picker forever, so the
    // pendingFields bypass must require the absence of errorFields.createReport.
    it('filters out optimistic reports whose create failed (pendingFields ADD + errorFields.createReport set)', async () => {
        // Given a workspace with instant submit and no approvers, and an optimistic report that
        // both still has pendingFields.createReport === ADD AND has errorFields.createReport set,
        // populated with a non-reimbursable transaction (matching the post-failure Onyx state).
        await act(async () => {
            await setupOnyxData(
                buildInstantSubmitNoApproversPolicy(),
                [
                    buildExpenseReport('failedOptimisticReport', {
                        pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                        errorFields: {createReport: {timestamp: 'report.genericCreateReportFailureMessage'}},
                    }),
                ],
                [{transactionID: 'txnFailed', reportID: 'failedOptimisticReport', reimbursable: false}],
            );
        });

        // When the hook computes outstanding reports
        const {result} = renderHook(() => useOutstandingReports(undefined, POLICY_ID, ACCOUNT_ID, false));

        // Then the failed optimistic report should be filtered out as ineligible — the create
        // already failed so it can never become a valid move-expense destination
        await waitFor(() => {
            expect(result.current.length).toBe(0);
        });
    });
});
