import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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
            action: CONST.IOU.ACTION.CREATE,
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
            shouldWaitForUpcomingTransition: true,
        });
        expect(navigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
    });

    it('should resolve activeReportID to backToReport when provided', () => {
        cleanupAndNavigateAfterExpenseCreate({
            action: CONST.IOU.ACTION.CREATE,
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
            action: CONST.IOU.ACTION.CREATE,
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
            action: CONST.IOU.ACTION.CREATE,
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
            action: CONST.IOU.ACTION.CREATE,
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

    it('should set shouldAddPendingNewTransactionIDs=true for CREATE into a brand-new optimistic chat that is not yet in the report cache', () => {
        // A brand-new optimistic chat created the same tick is NOT in the report cache, so getReportOrDraftReport returns undefined.
        (getReportOrDraftReport as jest.Mock).mockReturnValue(undefined);

        cleanupAndNavigateAfterExpenseCreate({
            action: CONST.IOU.ACTION.CREATE,
            report: undefined,
            draftTransactionIDs: [],
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            optimisticChatReportID: 'optimistic-chat-not-in-cache',
        });

        // Gating must use the resolved destination ID, not the (empty) cached report.
        expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                activeReportID: 'optimistic-chat-not-in-cache',
                shouldAddPendingNewTransactionIDs: true,
            }),
        );
    });

    it('should derive hasMultipleTransactions=true when the resolved activeReportID points to a money-request report', () => {
        const resolvedFinalReport = {reportID: 'expense-1'} as Report;
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);
        (getReportOrDraftReport as jest.Mock).mockReturnValue(resolvedFinalReport);

        cleanupAndNavigateAfterExpenseCreate({
            action: CONST.IOU.ACTION.CREATE,
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
            action: CONST.IOU.ACTION.CREATE,
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
            action: CONST.IOU.ACTION.CREATE,
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
            shouldAddPendingNewTransactionIDs: false,
        });
    });

    describe('shouldAddPendingNewTransactionIDs derivation', () => {
        it('should always be true for CATEGORIZE (move-from-track to a workspace), even with a backToReport diversion', () => {
            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.CATEGORIZE,
                report: chatReport,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: false,
                backToReport: 'somewhere-else',
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: true}));
        });

        it('should always be true for SHARE', () => {
            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.SHARE,
                report: chatReport,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: false,
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: true}));
        });

        it('should be true for CREATE when backToReport is the receiving chat', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(false);

            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.CREATE,
                report: chatReport,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: false,
                backToReport: 'receiving-chat',
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: true}));
        });

        it('should be false for CREATE when backToReport points to a money-request (expense) report', () => {
            jest.mocked(getReportOrDraftReport).mockReturnValue(expenseReport);
            jest.mocked(isMoneyRequestReport).mockReturnValue(true);

            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.CREATE,
                report: chatReport,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: false,
                backToReport: 'back-expense',
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: false}));
        });

        it('should be false for CREATE when navigation lands on a money-request (expense) report instead of the chat', () => {
            (isMoneyRequestReport as jest.Mock).mockReturnValue(true);

            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.CREATE,
                report: expenseReport,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: false,
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: false}));
        });

        it('should be false for an invoice', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(false);

            cleanupAndNavigateAfterExpenseCreate({
                action: CONST.IOU.ACTION.CREATE,
                report: undefined,
                draftTransactionIDs: [],
                transactionID: 'txn-1',
                isFromGlobalCreate: true,
                optimisticChatReportID: 'invoice-room-1',
                isInvoice: true,
            });

            expect(navigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({shouldAddPendingNewTransactionIDs: false}));
        });
    });
});
