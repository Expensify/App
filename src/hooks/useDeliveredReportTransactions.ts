import type {Transaction} from '@src/types/onyx';

import {useState} from 'react';

type DeliveredReportTransactionsParams = {
    reportID: string | undefined;
    transactions: Transaction[];

    /** Counted before the caller filters any out. */
    arrivedTransactionCount: number;

    expectedTransactionCount: number;
};

/**
 * Withholds a report's transactions until all have arrived, so a partial list never becomes the diff's baseline. Stays delivered
 * once delivered, since adding an expense raises the expected count before its transaction arrives.
 */
function useDeliveredReportTransactions({reportID, transactions, arrivedTransactionCount, expectedTransactionCount}: DeliveredReportTransactionsParams): Transaction[] | undefined {
    const [deliveredReportID, setDeliveredReportID] = useState<string | undefined>(undefined);

    const hasEveryTransactionArrived = arrivedTransactionCount >= expectedTransactionCount;

    if (hasEveryTransactionArrived && deliveredReportID !== reportID) {
        setDeliveredReportID(reportID);
    }

    // Nothing has been delivered yet when `deliveredReportID` is still its initial `undefined`, so an unknown report must not match it.
    const wasDelivered = reportID !== undefined && deliveredReportID === reportID;
    return hasEveryTransactionArrived || wasDelivered ? transactions : undefined;
}

export default useDeliveredReportTransactions;
