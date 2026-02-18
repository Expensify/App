import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

/**
 * Hook to fetch transactions associated with a specific `tripRoom` report.
 *
 * Since trip rooms and their transactions lack a direct connection, this hook
 * fetches all child reports and transactions from Onyx and filters them to derive
 * relevant transactions for the given trip room.
 *
 * @param reportID - The trip room's reportID.
 * @returns Transactions linked to the specified trip room.
 */
function useTripTransactions(reportID: string | undefined): Transaction[] {
    const tripTransactionReportIDsSelector = useCallback(
        (reports: OnyxCollection<Report>) =>
            Object.values(reports ?? {})
                .filter((report) => report && report.chatReportID === reportID)
                .map((report) => report?.reportID),
        [reportID],
    );

    const [tripTransactionReportIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: tripTransactionReportIDsSelector,
        canBeMissing: true,
    });

    const tripTransactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            if (!tripTransactionReportIDs.length) {
                return [];
            }

            return Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => !!transaction && tripTransactionReportIDs.includes(transaction.reportID));
        },
        [tripTransactionReportIDs],
    );

    const [tripTransactions = getEmptyArray<Transaction>()] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: tripTransactionsSelector,
            canBeMissing: true,
        },
        [tripTransactionsSelector],
    );
    return tripTransactions;
}

export default useTripTransactions;
