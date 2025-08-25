import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

/**
 * Hook to get all transactions for a specific report
 */
function useReportTransactions(reportID: string | undefined): Transaction[] {
    const [reportTransactions = getEmptyArray<Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => {
            if (!transactions || !reportID) {
                return [];
            }

            return Object.values(transactions).filter((transaction): transaction is Transaction => !!transaction && transaction.reportID === reportID);
        },
        canBeMissing: true,
    });

    return reportTransactions;
}

export default useReportTransactions;
