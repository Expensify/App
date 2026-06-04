import type {OnyxCollection} from 'react-native-onyx';
import type TransactionType from '@src/types/onyx/Transaction';

const transactionsByReportIDSelector = (transactions: OnyxCollection<TransactionType>): Record<string, TransactionType[]> => {
    const result: Record<string, TransactionType[]> = {};
    if (!transactions) {
        return result;
    }
    for (const transaction of Object.values(transactions)) {
        if (!transaction?.reportID) {
            continue;
        }
        (result[transaction.reportID] ??= []).push(transaction);
    }
    return result;
};
// eslint-disable-next-line import/prefer-default-export -- this file will include more selectors, so we want don't want to export single selector as default
export {transactionsByReportIDSelector};
