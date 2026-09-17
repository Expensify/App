import {renderHook} from '@testing-library/react-native';

import useReportPrimaryAction from '@hooks/useReportPrimaryAction';

import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const mockGetReportPrimaryAction = jest.mocked(getReportPrimaryAction);

const REPORT_ID = 'report1';
const POLICY_ID = 'policy1';

// Prefixed with `mock` so they can be referenced inside the hoisted jest.mock factory below.
const mockHeldTransaction = createMock<Transaction>({transactionID: 'held', reportID: REPORT_ID, comment: {hold: 'holdID'}});
const mockPendingDeleteTransaction = createMock<Transaction>({transactionID: 'unheld', reportID: REPORT_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@libs/ReportPrimaryActionUtils', () => ({
    getReportPrimaryAction: jest.fn(() => ''),
}));

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: () => ({transactions: {held: mockHeldTransaction, unheld: mockPendingDeleteTransaction}, violations: {}}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({login: 'test@example.com', accountID: 1}),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@components/PaymentAnimationsContext', () => ({
    usePaymentAnimationsContext: () => ({isPaidAnimationRunning: false, isApprovedAnimationRunning: false, isSubmittingAnimationRunning: false}),
}));

jest.mock('@components/MoneyReportTransactionThreadContext', () => ({
    useMoneyReportTransactionThread: () => ({reportActions: []}),
}));

// Return a minimal IOU report for the money request report key so isExpenseReport is false (skips the early return); undefined for everything else.
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === `report_${REPORT_ID}`) {
            return [{reportID: REPORT_ID, type: 'iou', policyID: POLICY_ID, ownerAccountID: 1}];
        }
        return [undefined];
    },
}));

describe('useReportPrimaryAction - offline pending-delete transactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
    });

    it('drops pending-delete transactions from the held-state calculation while online', () => {
        renderHook(() => useReportPrimaryAction(REPORT_ID));

        const passedTransactions = mockGetReportPrimaryAction.mock.calls.at(0)?.at(0)?.reportTransactions;
        expect(passedTransactions).toHaveLength(1);
        expect(passedTransactions?.at(0)?.transactionID).toBe('held');
    });

    it('keeps pending-delete transactions while offline so the report is not treated as all-held', () => {
        mockIsOffline = true;
        renderHook(() => useReportPrimaryAction(REPORT_ID));

        const passedTransactions = mockGetReportPrimaryAction.mock.calls.at(0)?.at(0)?.reportTransactions;
        expect(passedTransactions).toHaveLength(2);
        expect(passedTransactions?.map((transaction) => transaction.transactionID)).toEqual(expect.arrayContaining(['held', 'unheld']));
    });
});
