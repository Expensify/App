import {act, renderHook} from '@testing-library/react-native';

import useConfirmApproval from '@components/MoneyReportHeaderPrimaryAction/useConfirmApproval';

import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    approveMoneyRequest: jest.fn(),
}));
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'approver@test.com'}),
}));
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
}));
jest.mock('@hooks/useDelegateAccountID', () => ({
    __esModule: true,
    default: () => undefined,
}));
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: jest.fn(() => ({transactions: {}, violations: {}, isLoaded: true})),
}));

const REPORT_ID = '1001';

const snapshotReport = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'policy1',
} as Report;

const unheldTransaction: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: REPORT_ID, amount: -100, comment: {}};
const heldTransaction: Transaction = {...createRandomTransaction(2), transactionID: 'B', reportID: REPORT_ID, amount: -200, comment: {hold: 'holdReportActionID'}};

const mockedUseTransactionsAndViolationsForReport = jest.mocked(useTransactionsAndViolationsForReport);
const mockedApproveMoneyRequest = jest.mocked(approveMoneyRequest);

function mockLiveTransactions(transactions: Transaction[]) {
    mockedUseTransactionsAndViolationsForReport.mockReturnValue({
        transactions: Object.fromEntries(transactions.map((transaction) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction])),
        violations: {},
        isLoaded: true,
    });
}

describe('useConfirmApproval', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockLiveTransactions([]);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('merges snapshot and live transactions, preferring the live copy of a transaction present in both', async () => {
        // Given a Search row whose held expense B only exists in the snapshot, while expense A is in both the snapshot and live Onyx with a newer amount
        const liveUnheldTransaction = {...unheldTransaction, amount: -150};
        mockLiveTransactions([liveUnheldTransaction]);

        // When the hook resolves the report's transactions with the snapshot transactions as the fallback
        const {result} = renderHook(() => useConfirmApproval(REPORT_ID, () => {}, {fallbackReport: snapshotReport, fallbackTransactions: [unheldTransaction, heldTransaction]}));
        await act(waitForBatchedUpdates);

        // Then both expenses are kept so the held one is still detected, and the live copy of A replaces the snapshot copy
        expect(result.current.transactions).toEqual([liveUnheldTransaction, heldTransaction]);
        expect(result.current.isAnyTransactionOnHold).toBe(true);
    });

    it('uses only the live transactions when there is no snapshot fallback', async () => {
        // Given the report header, which has no snapshot, and a report with only an unheld expense in live Onyx
        mockLiveTransactions([unheldTransaction]);

        // When the hook resolves the report's transactions without fallback transactions
        const {result} = renderHook(() => useConfirmApproval(REPORT_ID, () => {}));
        await act(waitForBatchedUpdates);

        // Then the live transactions are returned as is and nothing is reported as held
        expect(result.current.transactions).toEqual([unheldTransaction]);
        expect(result.current.isAnyTransactionOnHold).toBe(false);
    });

    it('returns and approves the snapshot report when the report is not in live Onyx yet', async () => {
        // Given a Search row whose report has not been loaded into live Onyx
        const {result} = renderHook(() => useConfirmApproval(REPORT_ID, () => {}, {fallbackReport: snapshotReport, fallbackTransactions: [heldTransaction]}));
        await act(waitForBatchedUpdates);

        // When the user approves only the unheld expenses
        act(() => {
            result.current.onApprove(false);
        });

        // Then the button and the approval both use the snapshot report, so the shown options match what gets approved
        expect(result.current.moneyRequestReport).toEqual(snapshotReport);
        expect(mockedApproveMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({expenseReport: snapshotReport, full: false}));
    });
});
