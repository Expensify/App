import type {Transaction} from '@src/types/onyx';

import useReportTransactionsCollection from './useReportTransactionsCollection';

/**
 * Hook to get all transactions for a specific report
 */
function useReportTransactions(reportID: string | undefined): Transaction[] {
    const reportTransactions = useReportTransactionsCollection(reportID);

    return Object.values(reportTransactions ?? {}).filter((transaction): transaction is Transaction => !!transaction);
}

export default useReportTransactions;
