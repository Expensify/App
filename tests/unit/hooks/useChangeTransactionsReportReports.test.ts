import {renderHook, waitFor} from '@testing-library/react-native';

import useChangeTransactionsReportReports from '@hooks/useChangeTransactionsReportReports';

import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const CURRENT_USER_ID = 1;
const SELF_DM_REPORT_ID = 'selfDM1';
const OLD_REPORT_ID = 'oldReport1';
const NEW_REPORT_ID = 'newReport1';
const DESTINATION_REPORT_ID = 'destinationReport1';
const UNRELATED_REPORT_ID = 'unrelatedReport1';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    return {...createRandomTransaction(1), transactionID: 'transaction1', ...values};
}

function generateIOUAction(transaction: Transaction, reportID: string, childReportID?: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID: rand64(),
        reportID,
        childReportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ID,
        created: DateUtils.getDBTime(),
        originalMessage: {
            IOUTransactionID: transaction.transactionID,
            amount: transaction.amount,
            currency: transaction.currency,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
    };
}

describe('useChangeTransactionsReportReports', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, {reportID: SELF_DM_REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${UNRELATED_REPORT_ID}`, {reportID: UNRELATED_REPORT_ID});
        await waitForBatchedUpdates();
    });

    it('always includes the self-DM report and the destination report, even with no transactions', async () => {
        const {result} = renderHook(() => useChangeTransactionsReportReports([], DESTINATION_REPORT_ID));

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(Object.keys(result.current ?? {})).toEqual(expect.arrayContaining([`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`]));
        expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}${UNRELATED_REPORT_ID}`]).toBeUndefined();
    });

    it('looks up the IOU action under the transaction current report, not the self-DM report, for a reported transaction', async () => {
        const transaction = generateTransaction({reportID: OLD_REPORT_ID});
        const realAction = generateIOUAction(transaction, OLD_REPORT_ID, 'realThread1');
        // Decoy: an IOU action for the SAME transactionID sitting under the self-DM report (e.g. stale data from
        // before the transaction was ever reported). A source-selection regression that checks both reportID and
        // selfDMReportID unconditionally would incorrectly pick this up too.
        const decoyAction = generateIOUAction(transaction, SELF_DM_REPORT_ID, 'decoyThread1');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OLD_REPORT_ID}`, {[realAction.reportActionID]: realAction});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`, {[decoyAction.reportActionID]: decoyAction});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLD_REPORT_ID}`, {reportID: OLD_REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}realThread1`, {reportID: 'realThread1'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}decoyThread1`, {reportID: 'decoyThread1'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useChangeTransactionsReportReports([transaction], NEW_REPORT_ID));

        await waitFor(() => {
            expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}realThread1`]).toBeDefined();
        });

        expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}decoyThread1`]).toBeUndefined();
    });

    it('looks up the IOU action under the self-DM report for an unreported transaction', async () => {
        const transaction = generateTransaction({reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        const trackAction = generateIOUAction(transaction, SELF_DM_REPORT_ID, 'trackThread1');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`, {[trackAction.reportActionID]: trackAction});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}trackThread1`, {reportID: 'trackThread1'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useChangeTransactionsReportReports([transaction], undefined));

        await waitFor(() => {
            expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}trackThread1`]).toBeDefined();
        });
    });

    it('skips the IOU action lookup entirely for a deleted (trashed) transaction', async () => {
        const transaction = generateTransaction({reportID: CONST.REPORT.TRASH_REPORT_ID});
        const staleAction = generateIOUAction(transaction, SELF_DM_REPORT_ID, 'staleThread1');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`, {[staleAction.reportActionID]: staleAction});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}staleThread1`, {reportID: 'staleThread1'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useChangeTransactionsReportReports([transaction], undefined));

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}staleThread1`]).toBeUndefined();
    });

    it('narrows the result to only the computed ids, excluding unrelated reports in the collection', async () => {
        const transaction = generateTransaction({reportID: OLD_REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLD_REPORT_ID}`, {reportID: OLD_REPORT_ID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useChangeTransactionsReportReports([transaction], undefined));

        await waitFor(() => {
            expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}${OLD_REPORT_ID}`]).toBeDefined();
        });

        expect(result.current?.[`${ONYXKEYS.COLLECTION.REPORT}${UNRELATED_REPORT_ID}`]).toBeUndefined();
    });
});
