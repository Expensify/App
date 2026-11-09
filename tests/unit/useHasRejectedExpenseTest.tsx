import {act, renderHook} from '@testing-library/react-native';

import useHasRejectedExpense from '@hooks/useHasRejectedExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'submitter@mail.com';
const OTHER_USER_ACCOUNT_ID = 2;
const OTHER_USER_EMAIL = 'approver@mail.com';

const createExpenseReport = (reportID: string, ownerAccountID: number, overrides: Partial<Report> = {}): Report => ({
    ...createRandomReport(1),
    reportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    ownerAccountID,
    nextStep: undefined,
    ...overrides,
});

const createTransaction = (transactionID: string, reportID: string): Transaction => ({
    ...createRandomTransaction(1),
    transactionID,
    reportID,
});

const createRejectedViolations = (rejectedBy: string): TransactionViolations => [
    {
        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
        type: CONST.VIOLATION_TYPES.WARNING,
        data: {rejectedBy, comment: ''},
        showInReview: true,
    },
];

const seedRejectedExpense = (transactionID: string, reportID: string, rejectedBy = OTHER_USER_EMAIL) =>
    Promise.all([
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, createTransaction(transactionID, reportID)),
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, createRejectedViolations(rejectedBy)),
    ]);

const renderRejectedExpenseHook = async () => {
    const hook = renderHook(() => useHasRejectedExpense());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useHasRejectedExpense', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    it('returns false when the user has no rejected expense', async () => {
        // Given an open report owned by the current user with no rejection
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report_1`, createExpenseReport('report_1', CURRENT_USER_ACCOUNT_ID));
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then there is nothing for the Rejected suggestion to show
        expect(result.current).toBe(false);
    });

    it('returns true when an expense on a report the user owns was rejected', async () => {
        // Given an approver rejected one expense on the current user's report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report_1`, createExpenseReport('report_1', CURRENT_USER_ACCOUNT_ID));
        await seedRejectedExpense('trans_1', 'report_1');
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then the submitter sees the Rejected suggestion
        expect(result.current).toBe(true);
    });

    it('returns true when a rejected expense was moved out of its report', async () => {
        // Given an expense rejected from an instantly submitted report, which leaves it unreported
        await seedRejectedExpense('trans_1', CONST.REPORT.UNREPORTED_REPORT_ID);
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then the expense still counts, because unreported expenses are only synced to their owner
        expect(result.current).toBe(true);
    });

    it('returns true when a whole report the user owns was rejected', async () => {
        // Given an approver rejected the current user's whole report back to them
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.REPORT}report_1`,
            createExpenseReport('report_1', CURRENT_USER_ACCOUNT_ID, {nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT}}),
        );
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then the submitter sees the Rejected suggestion
        expect(result.current).toBe(true);
    });

    it('returns false for an approver who rejected another user expense or report', async () => {
        // Given the current user is the approver who rejected another user's expense and whole report
        await Onyx.set(ONYXKEYS.SESSION, {email: OTHER_USER_EMAIL, accountID: OTHER_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report_1`, createExpenseReport('report_1', CURRENT_USER_ACCOUNT_ID));
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.REPORT}report_2`,
            createExpenseReport('report_2', CURRENT_USER_ACCOUNT_ID, {nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT}}),
        );
        await seedRejectedExpense('trans_1', 'report_1');
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then none of the approver's own expenses were rejected, so the suggestion stays hidden
        expect(result.current).toBe(false);
    });

    it('returns false for an admin who did not reject the expense but can see its violation', async () => {
        // Given a second admin keeps the rejected-expense violation of another user's expense
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@mail.com', accountID: 3});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report_1`, createExpenseReport('report_1', CURRENT_USER_ACCOUNT_ID));
        await seedRejectedExpense('trans_1', 'report_1');
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then the admin doesn't own the report, so the suggestion stays hidden
        expect(result.current).toBe(false);
    });

    it('returns false for an approver whose rejection left the expense unreported', async () => {
        // Given the approver's local copy of an expense they rejected from an instantly submitted report
        await Onyx.set(ONYXKEYS.SESSION, {email: OTHER_USER_EMAIL, accountID: OTHER_USER_ACCOUNT_ID});
        await seedRejectedExpense('trans_1', CONST.REPORT.UNREPORTED_REPORT_ID, OTHER_USER_EMAIL);
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = await renderRejectedExpenseHook();

        // Then the approver's own rejection doesn't count
        expect(result.current).toBe(false);
    });
});
