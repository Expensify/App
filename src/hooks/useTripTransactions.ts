import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

function useTripTransactions(reportID: string | undefined): Transaction[] {
    const [tripTransactionReportIDs = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            Object.values(reports ?? {})
                .filter((report) => report && report.chatReportID === reportID)
                .map((report) => report?.reportID),
    });
    const [tripTransactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) =>
            Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => !!transaction && tripTransactionReportIDs.includes(transaction.reportID)),
    });

    return tripTransactions;
}

export default useTripTransactions;
