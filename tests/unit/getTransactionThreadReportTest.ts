import {getTransactionThreadReport} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

const PARENT_REPORT_ID = 'selfDMReport';
const THREAD_REPORT_ID = 'selfDMTransactionThread';
const TRANSACTION_ID = 'unreportedTransaction';
const ACTION_ID = 'iouAction';

const transaction = {...createRandomTransaction(1), transactionID: TRANSACTION_ID};
const selfDMThread = {
    ...createRandomReport(1),
    reportID: THREAD_REPORT_ID,
    parentReportID: PARENT_REPORT_ID,
    parentReportActionID: ACTION_ID,
};

function buildIOUAction(IOUTransactionID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID: ACTION_ID,
        created: '2024-01-01 00:00:00',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            IOUTransactionID,
            amount: 100,
            currency: CONST.CURRENCY.USD,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
    };
}

describe('getTransactionThreadReport', () => {
    it('keeps the thread found from the expense report', () => {
        const expenseThread = {...createRandomReport(2), reportID: 'expenseThread'};

        // When the expense report already points at a thread, that thread is the one to audit on
        expect(getTransactionThreadReport(transaction, expenseThread, selfDMThread, buildIOUAction(TRANSACTION_ID))).toBe(expenseThread);
    });

    it('uses the open report when a self DM expense is unreported', () => {
        // Given a self DM expense with no thread stored on the expense itself, whose open report's parent action is the expense's IOU action
        const parentReportAction = buildIOUAction(TRANSACTION_ID);

        // Then the report the expense is open in is its thread
        expect(getTransactionThreadReport(transaction, undefined, selfDMThread, parentReportAction)?.reportID).toBe(THREAD_REPORT_ID);
    });

    it('does not treat an unrelated report as the thread', () => {
        // Given an open report whose parent action belongs to a different expense
        const parentReportAction = buildIOUAction('someOtherTransaction');

        // Then the open report is not used as the thread
        expect(getTransactionThreadReport(transaction, undefined, selfDMThread, parentReportAction)).toBeUndefined();
    });
});
