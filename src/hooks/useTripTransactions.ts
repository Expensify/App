import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

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
    const [tripTransactionReportIDs = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            Object.values(reports ?? {})
                .filter((report) => report && report.chatReportID === reportID)
                .map((report) => report?.reportID),
    });
    const [tripTransactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => {
            if (!tripTransactionReportIDs.length) {
                return [];
            }

            return Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => !!transaction && tripTransactionReportIDs.includes(transaction.reportID));
        },
    });

    return tripTransactions;
}

export default useTripTransactions;
