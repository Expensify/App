import {renderHook} from '@testing-library/react-native';

import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';

import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportPrimaryActionUtils from '@libs/ReportPrimaryActionUtils';
import * as TransactionUtils from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const REPORT_ID = 'report1';
const CHAT_REPORT_ID = 'chatReport1';

// Prefixed with `mock` so they can be referenced inside the hoisted jest.mock factory below.
const mockTransaction1 = createMock<Transaction>({transactionID: 'transaction1', reportID: REPORT_ID});
const mockTransaction2 = createMock<Transaction>({transactionID: 'transaction2', reportID: REPORT_ID});
const mockMoneyRequestReport = createMock<Report>({reportID: REPORT_ID, type: 'iou'});

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'test@example.com'}),
}));

jest.mock('@hooks/usePaginatedReportActions', () => ({
    __esModule: true,
    default: () => ({reportActions: []}),
}));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useTransactionViolations', () => ({
    __esModule: true,
    default: () => [],
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: () => ({transactions: {transaction1: mockTransaction1, transaction2: mockTransaction2}, violations: {}}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === `report_${REPORT_ID}`) {
            return [mockMoneyRequestReport];
        }
        return [undefined];
    },
}));

describe('useMoneyReportHeaderStatusBar - duplicate transactions', () => {
    beforeEach(() => {
        // Every other status-bar condition is stubbed to false so the test can isolate the hasDuplicates branch,
        // which is the line this hook's PR changed (threading `transactions` into hasDuplicateTransactions
        // instead of it recomputing them via the deprecated getReportTransactions default).
        jest.spyOn(ReportActionsUtils, 'getFilteredReportActionsForReportView').mockReturnValue([]);
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(undefined);
        jest.spyOn(ReportActionsUtils, 'getOriginalMessage').mockReturnValue(undefined);
        jest.spyOn(ReportActionsUtils, 'isMoneyRequestAction').mockReturnValue(false);
        jest.spyOn(ReportPrimaryActionUtils, 'isMarkAsResolvedAction').mockReturnValue(false);
        // isPaidGroupPolicy/isPaidGroupPolicyExpenseReport are billing-only and restricted from static import.
        // This hook never touches them, but a namespace import can't be statically proven not to, so these
        // ReportUtils spies go through require() instead (matches other tests spying on this module).
        jest.spyOn(require('@libs/ReportUtils'), 'hasOnlyHeldExpenses').mockReturnValue(false);
        jest.spyOn(require('@libs/ReportUtils'), 'isSettled').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'allHavePendingRTERViolation').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'hasDuplicateTransactions').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'isBrokenConnectionViolation').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'hasReceipt').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'isPayAtEndExpense').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'isPending').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'isScanning').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'shouldSuppressBrokenConnectionStatus').mockReturnValue(false);
        jest.spyOn(TransactionUtils, 'shouldShowBrokenConnectionViolationForMultipleTransactions').mockReturnValue(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('passes the report transactions through to hasDuplicateTransactions', () => {
        renderHook(() => useMoneyReportHeaderStatusBar(REPORT_ID, CHAT_REPORT_ID));

        expect(jest.mocked(TransactionUtils.hasDuplicateTransactions)).toHaveBeenCalledWith('test@example.com', 1, mockMoneyRequestReport, undefined, undefined, undefined, [
            mockTransaction1,
            mockTransaction2,
        ]);
    });

    it('shows the duplicates status bar when hasDuplicateTransactions reports duplicates on an unsettled report', () => {
        jest.spyOn(TransactionUtils, 'hasDuplicateTransactions').mockReturnValue(true);

        const {result} = renderHook(() => useMoneyReportHeaderStatusBar(REPORT_ID, CHAT_REPORT_ID));

        expect(result.current.shouldShowStatusBar).toBe(true);
        expect(result.current.statusBarType).toBe(CONST.REPORT.STATUS_BAR_TYPE.DUPLICATES);
    });

    it('does not show the duplicates status bar when the report is already settled, even if duplicates are found', () => {
        jest.spyOn(TransactionUtils, 'hasDuplicateTransactions').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'isSettled').mockReturnValue(true);

        const {result} = renderHook(() => useMoneyReportHeaderStatusBar(REPORT_ID, CHAT_REPORT_ID));

        expect(result.current.statusBarType).not.toBe(CONST.REPORT.STATUS_BAR_TYPE.DUPLICATES);
    });
});
