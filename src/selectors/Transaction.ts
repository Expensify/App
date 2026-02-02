import type {OnyxCollection} from 'react-native-onyx';
import {isPerDiemRequest, isTimeRequest} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

const hasPerDiemTransactionsSelector = (transactions: OnyxCollection<Transaction>, transactionIDs: string[]) => {
    return transactionIDs.some((transactionID) => {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return transaction && isPerDiemRequest(transaction);
    });
};

const hasTimeTransactionsSelector = (transactions: OnyxCollection<Transaction>, transactionIDs: string[]) =>
    transactionIDs.some((transactionID) => {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return transaction && isTimeRequest(transaction);
    });

export {hasPerDiemTransactionsSelector, hasTimeTransactionsSelector};
