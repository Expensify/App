import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import CONST from '@src/CONST';

const transactionItemBaseMock = {
    reportID: 'report123',
    transactionThreadReportID: 'thread123',
} as TransactionListItemType;

describe('MoneyRequestReportUtils', () => {
    describe('getReportIDForTransaction', () => {
        it('returns transaction thread ID if its not from one transaction report', () => {
            const transactionItem = {...transactionItemBaseMock};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('thread123');
        });

        it('returns transaction thread ID if its from self DM', () => {
            const transactionItem = {...transactionItemBaseMock, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('thread123');
        });

        it('returns expense reportID if its from one transaction report', () => {
            const transactionItem = {...transactionItemBaseMock, isFromOneTransactionReport: true};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('report123');
        });

        it('returns reportID if transaction thread ID is 0 - unreported', () => {
            const transactionItem = {...transactionItemBaseMock, transactionThreadReportID: CONST.REPORT.UNREPORTED_REPORT_ID};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('report123');
        });
    });
});
