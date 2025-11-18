import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import CONST from '@src/CONST';

const transactionItemBaseMock: TransactionListItemType = {
    reportID: 'report123',
    transactionThreadReportID: 'thread123',
};

describe('MoneyRequestReportUtils', () => {
    describe('getReportIDForTransaction', () => {
        it('returns transaction thread ID if its not from one transaction report', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('thread123');
        });

        it('returns transaction thread ID if its from self DM', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('thread123');
        });

        it('returns expense reportID if its from one transaction report', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock, isFromOneTransactionReport: true};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('report123');
        });

        it('returns reportID if transaction thread ID is 0 - unreported', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock, transactionThreadReportID: CONST.REPORT.UNREPORTED_REPORT_ID};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('report123');
        });
    });
});
