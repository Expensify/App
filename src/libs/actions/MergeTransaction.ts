import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction} from '@src/types/onyx';

/**
 * Sets merge transaction data for a specific transaction
 */
function setMergeTransactionKey(transactionID: string, values: Partial<MergeTransaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, values);
}

/**
 * Fetches eligible transactions for merging
 */
function getTransactionsForMerging(transactionID: string) {
    const parameters: GetTransactionsForMergingParams = {
        transactionID,
    };

    API.read(READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING, parameters);
}

export {setMergeTransactionKey, getTransactionsForMerging};
