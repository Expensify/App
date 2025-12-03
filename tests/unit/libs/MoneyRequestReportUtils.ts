import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
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
