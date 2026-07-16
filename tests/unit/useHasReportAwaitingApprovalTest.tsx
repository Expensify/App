import {act, renderHook} from '@testing-library/react-native';

import useHasReportAwaitingApproval from '@hooks/useHasReportAwaitingApproval';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const OTHER_USER_ACCOUNT_ID = 2;
const POLICY_ID = 'policy123';

// A report is awaiting the current user's approval when it is submitted, they are its manager, and its policy has
// approvals enabled. This mirrors the approve-bucket fixture in useTodoCountsTest.
const createApproveReport = (reportID: string, managerID = CURRENT_USER_ACCOUNT_ID): Report => ({
    ...createRandomReport(Number(reportID.replace(/\D/g, '')) || 1),
    reportID,
    chatReportID: `chat_${reportID}`,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    ownerAccountID: OTHER_USER_ACCOUNT_ID,
    managerID,
});

const createApprovePolicy = (): Policy => ({
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    id: POLICY_ID,
    role: CONST.POLICY.ROLE.ADMIN,
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
});

// Deterministic, fully posted transaction so it is neither scanning nor pending, which would exclude the report.
const createPostedTransaction = (transactionID: string, reportID: string): Transaction => ({
    ...createRandomTransaction(1),
    transactionID,
    reportID,
    status: CONST.TRANSACTION.STATUS.POSTED,
    receipt: {},
    comment: {},
});

const setReports = (reports: Report[]) => Promise.all(reports.map((report) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report)));
const setTransactions = (transactions: Transaction[]) =>
    Promise.all(transactions.map((transaction) => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction)));

const seedApproveReport = (reportID: string, managerID = CURRENT_USER_ACCOUNT_ID) =>
    Promise.all([setReports([createApproveReport(reportID, managerID)]), setTransactions([createPostedTransaction(`trans_${reportID}`, reportID)])]);

const renderApprovalWatch = async (shouldWatchForApprovals = true) => {
    const hook = renderHook(({shouldWatch}: {shouldWatch: boolean}) => useHasReportAwaitingApproval(shouldWatch), {initialProps: {shouldWatch: shouldWatchForApprovals}});
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useHasReportAwaitingApproval', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns false when there is no report awaiting the current user approval', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();

        const {result} = await renderApprovalWatch();

        expect(result.current).toBe(false);
    });

    it('returns true when a report is awaiting the current user approval', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createApprovePolicy());
        await seedApproveReport('approve_1');
        await waitForBatchedUpdates();

        const {result} = await renderApprovalWatch();

        expect(result.current).toBe(true);
    });

    it('returns false when the report is awaiting another user approval', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createApprovePolicy());
        await seedApproveReport('approve_other', OTHER_USER_ACCOUNT_ID);
        await waitForBatchedUpdates();

        const {result} = await renderApprovalWatch();

        expect(result.current).toBe(false);
    });

    it('does not recompute while frozen, then recomputes once re-enabled', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createApprovePolicy());
        await waitForBatchedUpdates();

        const {result, rerender} = await renderApprovalWatch();
        expect(result.current).toBe(false);

        // Freeze the hook, then add a report awaiting approval - the result must stay at the captured value.
        rerender({shouldWatch: false});
        await act(async () => {
            await waitForBatchedUpdates();
        });
        await act(async () => {
            await seedApproveReport('approve_frozen');
            await waitForBatchedUpdates();
        });
        expect(result.current).toBe(false);

        // Re-enable - it recomputes and picks up the report added while frozen.
        rerender({shouldWatch: true});
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(result.current).toBe(true);
    });
});
