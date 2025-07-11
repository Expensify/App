import type {OnyxEntry} from 'react-native-onyx';
import type {MergeTransaction} from '@src/types/onyx';

const getTargetTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>) => {
    if (!mergeTransaction?.targetTransactionID) {
        return null;
    }

    return mergeTransaction.eligibleTransactions?.find((transaction) => transaction.transactionID === mergeTransaction.targetTransactionID);
};

const getSourceTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>) => {
    if (!mergeTransaction?.sourceTransactionID) {
        return null;
    }

    return mergeTransaction.eligibleTransactions?.find((transaction) => transaction.transactionID === mergeTransaction.sourceTransactionID);
};

export {getTargetTransaction, getSourceTransaction};
