import type {OnyxEntry} from 'react-native-onyx';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());
jest.mock('@libs/Navigation/helpers/navigateAfterExpenseCreate', () => jest.fn());

jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
    isMoneyRequestReport: jest.fn(),
}));

const chatReport = {reportID: 'chat-1'} as Report;
const expenseReport = {reportID: 'expense-1', chatReportID: 'linked-chat-1'} as Report;

describe('cleanupAndNavigateAfterExpenseCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);
        (getReportOrDraftReport as jest.Mock).mockReturnValue(undefined);
    });

    it('should delegate cleanup to cleanupAfterExpenseCreate and navigation to navigateAfterExpenseCreate', () => {
        const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as OnyxEntry<ReportAction>;

        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: ['txn-1'],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            linkedTrackedExpenseReportAction,
        });

        expect(cleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
            draftTransactionIDs: ['txn-1'],
            linkedTrackedExpenseReportAction,
        });
        expect(navigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
    });

    it('should resolve activeReportID to backToReport when provided', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            backToReport: 'back-to-this-report',
            optimisticChatReportID: 'optimistic-should-be-ignored',
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'back-to-this-report',
            }),
        );
    });

    it('should resolve activeReportID to report.reportID when report is an expense report', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'expense-1',
            }),
        );
    });

    it('should resolve activeReportID to report.reportID for a regular (non-expense) chat report', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'chat-1',
            }),
        );
    });

    it('should fall back to optimisticChatReportID when report is undefined', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: undefined,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            optimisticChatReportID: 'self-dm-fallback',
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'self-dm-fallback',
            }),
        );
    });

    it('should derive hasMultipleTransactions=true when the resolved activeReportID points to a money-request report', () => {
        const resolvedFinalReport = {reportID: 'expense-1'} as Report;
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);
        (getReportOrDraftReport as jest.Mock).mockReturnValue(resolvedFinalReport);

        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'expense-1',
                hasMultipleTransactions: true,
            }),
        );
    });

    it('should derive hasMultipleTransactions=false when the resolved activeReportID points to a chat report', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);
        (getReportOrDraftReport as jest.Mock).mockReturnValue(chatReport);

        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'chat-1',
                hasMultipleTransactions: false,
            }),
        );
    });

    it('should pass isInvoice, isFromGlobalCreate, and transactionID through to navigateAfterExpenseCreate', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: [],
            transactionID: 'txn-42',
            isFromGlobalCreate: true,
            isInvoice: true,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith({
            activeReportID: 'chat-1',
            transactionID: 'txn-42',
            isFromGlobalCreate: true,
            isInvoice: true,
            hasMultipleTransactions: false,
        });
    });
});
