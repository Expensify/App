import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Transaction} from '@src/types/onyx';

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

/**
 * Fetches eligible transactions for merging locally
 * This is FE version of READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING API call
 */
function getTransactionsForMergingLocally(transactionID: string, transactions: OnyxCollection<Transaction>) {
    const transactionsArray = Object.values(transactions ?? {});

    const targetTransaction = transactionsArray.find((transaction) => transaction?.transactionID === transactionID);
    if (!targetTransaction || !transactionsArray) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {
            eligibleTransactions: [],
        });
        return;
    }

    // TODO: Will implement this later
    const eligibleTransactions = transactionsArray.filter((transaction): transaction is Transaction => !!transaction && transaction.transactionID !== transactionID);

    Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {
        eligibleTransactions,
    });
}

export {setMergeTransactionKey, getTransactionsForMerging, getTransactionsForMergingLocally};
