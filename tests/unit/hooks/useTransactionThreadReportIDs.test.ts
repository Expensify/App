import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionThreadReportIDs from '@hooks/useTransactionThreadReportIDs';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';

function makeIouAction(transactionID: string, reportActionID: string, childReportID?: string): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            IOUTransactionID: transactionID,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
        message: [{type: 'TEXT', text: 'IOU'}],
        childReportID,
    } as unknown as ReportAction;
}

describe('useTransactionThreadReportIDs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('returns an empty record when transactionIDList is undefined', async () => {
        const {result} = renderHook(() => useTransactionThreadReportIDs(undefined));

        await waitFor(() => {
            expect(result.current).toEqual({});
        });
    });

    it('returns an empty record when transactionIDList is empty', async () => {
        const {result} = renderHook(() => useTransactionThreadReportIDs([]));

        await waitFor(() => {
            expect(result.current).toEqual({});
        });
    });

    it('maps a transactionID to the childReportID of its IOU action', async () => {
        const transactionID = 'txn1';
        const reportID = 'report1';
        const childReportID = 'thread1';

        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = reportID;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            action1: makeIouAction(transactionID, 'action1', childReportID),
        });

        const {result} = renderHook(() => useTransactionThreadReportIDs([transactionID]));

        await waitFor(() => {
            expect(result.current[transactionID]).toBe(childReportID);
        });
    });

    it('returns undefined for a transaction whose IOU action has no childReportID', async () => {
        const transactionID = 'txn1';
        const reportID = 'report1';

        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = reportID;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            action1: makeIouAction(transactionID, 'action1'),
        });

        const {result} = renderHook(() => useTransactionThreadReportIDs([transactionID]));

        await waitFor(() => {
            expect(result.current).toEqual({[transactionID]: undefined});
        });
    });

    it('skips transactions with no matching IOU action', async () => {
        const transactionID = 'txn1';
        const reportID = 'report1';

        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = reportID;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});

        const {result} = renderHook(() => useTransactionThreadReportIDs([transactionID]));

        await waitFor(() => {
            expect(result.current).toEqual({[transactionID]: undefined});
        });
    });

    it('handles cross-report duplicates by resolving each transaction in its own report', async () => {
        const txnA = 'txnA';
        const txnB = 'txnB';
        const reportA = 'reportA';
        const reportB = 'reportB';
        const childA = 'threadA';
        const childB = 'threadB';

        const transactionA = createRandomTransaction(1);
        transactionA.transactionID = txnA;
        transactionA.reportID = reportA;

        const transactionB = createRandomTransaction(2);
        transactionB.transactionID = txnB;
        transactionB.reportID = reportB;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnA}`, transactionA);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnB}`, transactionB);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportA}`, {
            actionA: makeIouAction(txnA, 'actionA', childA),
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportB}`, {
            actionB: makeIouAction(txnB, 'actionB', childB),
        });

        const {result} = renderHook(() => useTransactionThreadReportIDs([txnA, txnB]));

        await waitFor(() => {
            expect(result.current).toEqual({
                [txnA]: childA,
                [txnB]: childB,
            });
        });
    });

    it('reactively updates when the IOU action becomes available', async () => {
        const transactionID = 'txn1';
        const reportID = 'report1';
        const childReportID = 'thread1';

        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = reportID;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() => useTransactionThreadReportIDs([transactionID]));

        await waitFor(() => {
            expect(result.current).toEqual({[transactionID]: undefined});
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            action1: makeIouAction(transactionID, 'action1', childReportID),
        });

        await waitFor(() => {
            expect(result.current[transactionID]).toBe(childReportID);
        });
    });
});
