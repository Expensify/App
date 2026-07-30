import {getAllNonDeletedTransactions, getThreadReportIDsForTransactions, isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';

import CONST from '@src/CONST';
import type {ReportAction, Transaction} from '@src/types/onyx';

import {actionR14932, actionR98765} from '../../../__mocks__/reportData/actions';
import {transactionR14932, transactionR98765} from '../../../__mocks__/reportData/transactions';

describe('getThreadReportIDsForTransactions', () => {
    test('returns empty list for no transactions', () => {
        const result = getThreadReportIDsForTransactions([actionR14932], []);
        expect(result).toEqual([]);
    });

    test('returns empty list for transactions but no reportActions', () => {
        const result = getThreadReportIDsForTransactions([], [transactionR14932]);
        expect(result).toEqual([]);
    });

    test('returns list of reportIDs for transactions which have matching reportActions', () => {
        const reportActions = [actionR14932, actionR98765] satisfies ReportAction[];
        const transactions = [{...transactionR14932}, {...transactionR98765}] satisfies Transaction[];

        const result = getThreadReportIDsForTransactions(reportActions, transactions);
        expect(result).toEqual(['CHILD_REPORT_ID_R14932', 'CHILD_REPORT_ID_R98765']);
    });

    test('returns empty list for transactions which have no matching reportActions', () => {
        // fakeAction456 has originalMessage with undefined id, so cannot be mapped
        const reportActions = [{...actionR98765, originalMessage: {}}] satisfies ReportAction[];
        const transactions = [{...transactionR14932}, {...transactionR98765}] satisfies Transaction[];

        const result = getThreadReportIDsForTransactions(reportActions, transactions);
        expect(result).toEqual([]);
    });
});

describe('isActionVisibleOnMoneyRequestReport', () => {
    test('hides created action by default', () => {
        const createdAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        } as ReportAction;

        expect(isActionVisibleOnMoneyRequestReport(createdAction)).toBe(false);
    });

    test('shows created action when explicitly allowed', () => {
        const createdAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        } as ReportAction;

        expect(isActionVisibleOnMoneyRequestReport(createdAction, true)).toBe(true);
    });
});

describe('getAllNonDeletedTransactions', () => {
    test('should return all transactions that have IOU actions', () => {
        const transactions = {
            [transactionR14932.transactionID]: transactionR14932,
            [transactionR98765.transactionID]: transactionR98765,
        };
        const reportActions = [actionR14932, actionR98765];

        const result = getAllNonDeletedTransactions(transactions, reportActions);
        expect(result).toHaveLength(2);
    });

    test('should filter out transactions without IOU actions by default', () => {
        const orphanedTransaction = {...transactionR98765, transactionID: 'orphaned123'};
        const transactions = {
            [transactionR14932.transactionID]: transactionR14932,
            [orphanedTransaction.transactionID]: orphanedTransaction,
        };
        const reportActions = [actionR14932]; // Only has action for transactionR14932

        const result = getAllNonDeletedTransactions(transactions, reportActions, false, false);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe(transactionR14932.transactionID);
    });

    test('should include transactions without IOU actions when includeOrphanedTransactions is true', () => {
        const orphanedTransaction = {...transactionR98765, transactionID: 'orphaned123'};
        const transactions = {
            [transactionR14932.transactionID]: transactionR14932,
            [orphanedTransaction.transactionID]: orphanedTransaction,
        };
        const reportActions = [actionR14932]; // Only has action for transactionR14932

        const result = getAllNonDeletedTransactions(transactions, reportActions, false, true);
        expect(result).toHaveLength(2);
        expect(result.map((t) => t.transactionID)).toContain(transactionR14932.transactionID);
        expect(result.map((t) => t.transactionID)).toContain(orphanedTransaction.transactionID);
    });
});

describe('getAllNonDeletedTransactions - Expensify Card pending/posted deduplication', () => {
    function makeCardTransaction(transactionID: string, status: Transaction['status'], parentTransactionID = ''): Transaction {
        return {
            ...transactionR14932,
            transactionID,
            bank: CONST.EXPENSIFY_CARD.BANK,
            status,
            parentTransactionID,
        };
    }

    function makeNonCardTransaction(transactionID: string, status: Transaction['status'], parentTransactionID = ''): Transaction {
        return {
            ...transactionR14932,
            transactionID,
            bank: '',
            status,
            parentTransactionID,
        };
    }

    // Pass empty reportActions + includeOrphanedTransactions so the existing action-based filtering keeps every
    // transaction, isolating the card pending/posted deduplication behaviour.
    function getTransactions(transactions: Record<string, Transaction>) {
        return getAllNonDeletedTransactions(transactions, [], false, true);
    }

    test('hides the pending card auth when its posted counterpart is present', () => {
        const pending = makeCardTransaction('auth1', CONST.TRANSACTION.STATUS.PENDING);
        const posted = makeCardTransaction('clear1', CONST.TRANSACTION.STATUS.POSTED, 'auth1');

        const result = getTransactions({auth1: pending, clear1: posted});

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('clear1');
    });

    test('keeps a pending card auth that has no posted counterpart', () => {
        const pending = makeCardTransaction('auth1', CONST.TRANSACTION.STATUS.PENDING);

        const result = getTransactions({auth1: pending});

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('auth1');
    });

    test('hides every pending auth in a chain', () => {
        const rootAuth = makeCardTransaction('auth1', CONST.TRANSACTION.STATUS.PENDING);
        const incrementalAuth = makeCardTransaction('auth1b', CONST.TRANSACTION.STATUS.PENDING, 'auth1');
        const posted = makeCardTransaction('clear1', CONST.TRANSACTION.STATUS.POSTED, 'auth1');

        const result = getTransactions({auth1: rootAuth, auth1b: incrementalAuth, clear1: posted});

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('clear1');
    });

    test('keeps non-card pending rows when a card chain settles', () => {
        const cardPending = makeCardTransaction('auth1', CONST.TRANSACTION.STATUS.PENDING);
        const cardPosted = makeCardTransaction('clear1', CONST.TRANSACTION.STATUS.POSTED, 'auth1');
        const manualPending = makeNonCardTransaction('manual1', CONST.TRANSACTION.STATUS.PENDING);

        const result = getTransactions({auth1: cardPending, clear1: cardPosted, manual1: manualPending});

        const ids = result.map((transaction) => transaction.transactionID);
        expect(result).toHaveLength(2);
        expect(ids).toContain('clear1');
        expect(ids).toContain('manual1');
        expect(ids).not.toContain('auth1');
    });

    test('does not deduplicate across unrelated card auth chains', () => {
        const cardAPending = makeCardTransaction('authA', CONST.TRANSACTION.STATUS.PENDING);
        const cardAPosted = makeCardTransaction('clearA', CONST.TRANSACTION.STATUS.POSTED, 'authA');
        const cardBPending = makeCardTransaction('authB', CONST.TRANSACTION.STATUS.PENDING);

        const result = getTransactions({authA: cardAPending, clearA: cardAPosted, authB: cardBPending});

        const ids = result.map((transaction) => transaction.transactionID);
        expect(result).toHaveLength(2);
        expect(ids).toContain('clearA');
        expect(ids).toContain('authB');
        expect(ids).not.toContain('authA');
    });
});
