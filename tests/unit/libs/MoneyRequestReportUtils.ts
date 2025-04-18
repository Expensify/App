import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import {fakeAction456, action as fakeReportAction, transaction as fakeTransaction, fakeTransaction456} from '@src/stories/mockData/transactions';
import type {ReportAction, Transaction} from '@src/types/onyx';

describe('getThreadReportIDsForTransactions', () => {
    test('returns empty list for no transactions', () => {
        const result = getThreadReportIDsForTransactions([fakeReportAction], []);
        expect(result).toEqual([]);
    });

    test('returns empty list for transactions but no reportActions', () => {
        const result = getThreadReportIDsForTransactions([], [fakeTransaction]);
        expect(result).toEqual([]);
    });

    test('returns list of reportIDs for transactions which have matching reportActions', () => {
        const reportActions = [fakeReportAction, fakeAction456] satisfies ReportAction[];
        const transactions = [{...fakeTransaction, transactionID: '590639150582440369'}, {...fakeTransaction456}] satisfies Transaction[];

        const result = getThreadReportIDsForTransactions(reportActions, transactions);
        expect(result).toEqual(['1111111111111111', 'R98765']);
    });

    test('returns empty list for transactions which have no matching reportActions', () => {
        // fakeAction456 has originalMessage with undefined id, so cannot be mapped
        const reportActions = [{...fakeAction456, originalMessage: {}}] satisfies ReportAction[];
        const transactions = [{...fakeTransaction, transactionID: '590639150582440369'}, {...fakeTransaction456}] satisfies Transaction[];

        const result = getThreadReportIDsForTransactions(reportActions, transactions);
        expect(result).toEqual([]);
    });
});
