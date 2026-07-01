import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

/**
 * Hook to get all transactions for a specific report
 */
function useReportTransactions(reportID: string | undefined): Transaction[] {
    const [reportTransactions = getEmptyArray<Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions: OnyxCollection<Transaction>) => {
            if (!transactions || !reportID) {
                return [];
            }

            return Object.values(transactions).filter((transaction): transaction is Transaction => !!transaction && transaction.reportID === reportID);
        },
    });

    return reportTransactions;
}

export default useReportTransactions;
