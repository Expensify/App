import {getTransactionThreadReport} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

describe('getTransactionThreadReport', () => {
    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the thread found from the expense report', () => {
        const expenseThread = {...createRandomReport(2), reportID: 'expenseThread'};

        // When the expense report already points at a thread, that thread is the one to audit on
        expect(getTransactionThreadReport(transaction, expenseThread, selfDMThread)).toBe(expenseThread);
    });

    it('uses the open report when a self DM expense is unreported', async () => {
        // Given a self DM expense with no thread stored on the expense itself
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [ACTION_ID]: {
                reportActionID: ACTION_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {IOUTransactionID: TRANSACTION_ID},
            },
        });
        await waitForBatchedUpdates();

        // Then the report the expense is open in is its thread
        expect(getTransactionThreadReport(transaction, undefined, selfDMThread)?.reportID).toBe(THREAD_REPORT_ID);
    });

    it('does not treat an unrelated report as the thread', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [ACTION_ID]: {
                reportActionID: ACTION_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {IOUTransactionID: 'someOtherTransaction'},
            },
        });
        await waitForBatchedUpdates();

        expect(getTransactionThreadReport(transaction, undefined, selfDMThread)).toBeUndefined();
    });
});
