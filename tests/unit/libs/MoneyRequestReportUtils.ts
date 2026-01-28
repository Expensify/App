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
