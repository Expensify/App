import type {OnyxEntry} from 'react-native-onyx';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());
jest.mock('@libs/Navigation/helpers/navigateAfterExpenseCreate', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
    isMoneyRequestReport: jest.fn(),
}));

const chatReport = {reportID: 'chat-1'} as Report;
const expenseReport = {reportID: 'expense-1', chatReportID: 'linked-chat-1'} as Report;
const linkedChat = {reportID: 'linked-chat-1'} as Report;

describe('cleanupAndNavigateAfterExpenseCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);
        (getReportOrDraftReport as jest.Mock).mockReturnValue(undefined);
        (Navigation.getTopmostReportId as jest.Mock).mockReturnValue(undefined);
    });

    it('delegates cleanup to cleanupAfterExpenseCreate and navigation to navigateAfterExpenseCreate', () => {
        const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as OnyxEntry<ReportAction>;

        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: ['txn-1'],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
            linkedTrackedExpenseReportAction,
        });

        expect(cleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
            draftTransactionIDs: ['txn-1'],
            linkedTrackedExpenseReportAction,
        });
        expect(navigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
    });

    it('resolves activeReportID to backToReport when provided (backToReport wins over all other sources)', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);
        (Navigation.getTopmostReportId as jest.Mock).mockReturnValue('expense-1');

        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
            backToReport: 'back-to-this-report',
            optimisticChatReportID: 'optimistic-should-be-ignored',
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'back-to-this-report',
            }),
        );
    });

    it('resolves activeReportID to report.reportID when report is an expense report AND is topmost', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);
        (Navigation.getTopmostReportId as jest.Mock).mockReturnValue('expense-1');
        (getReportOrDraftReport as jest.Mock).mockReturnValue(linkedChat);

        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'expense-1',
            }),
        );
    });

    it('resolves activeReportID to linked chat report when expense report is NOT topmost', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);
        (Navigation.getTopmostReportId as jest.Mock).mockReturnValue('some-other-report');
        (getReportOrDraftReport as jest.Mock).mockReturnValue(linkedChat);

        cleanupAndNavigateAfterExpenseCreate({
            report: expenseReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'linked-chat-1',
            }),
        );
    });

    it('resolves activeReportID to report.reportID for a regular (non-expense) chat report', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);

        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'chat-1',
            }),
        );
    });

    it('falls back to optimisticChatReportID when report is undefined (P1 fix path)', () => {
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);

        cleanupAndNavigateAfterExpenseCreate({
            report: undefined,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
            optimisticChatReportID: 'self-dm-fallback',
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'self-dm-fallback',
            }),
        );
    });

    it('passes isInvoice, isFromGlobalCreate, hasMultipleTransactions, and transactionID through to navigateAfterExpenseCreate', () => {
        cleanupAndNavigateAfterExpenseCreate({
            report: chatReport,
            draftTransactionIDs: [],
            transactionID: 'txn-42',
            isFromGlobalCreate: true,
            hasMultipleTransactions: true,
            isInvoice: true,
        });

        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith({
            activeReportID: 'chat-1',
            transactionID: 'txn-42',
            isFromGlobalCreate: true,
            isInvoice: true,
            hasMultipleTransactions: true,
        });
    });
});
