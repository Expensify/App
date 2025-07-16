import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import {getTransactionViolationsOfTransaction} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Transaction} from '@src/types/onyx';

/**
 * Setup merge transaction data for merging flow
 */
function setupMergeTransactionData(transactionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {targetTransactionID: transactionID});
}

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

/**
 * Merges two transactions by updating the target transaction with selected fields and deleting the source transaction
 */
function mergeTransactionRequest(mergeTransactionID: string, mergeTransaction: MergeTransaction, targetTransaction: Transaction, sourceTransaction: Transaction) {
    // Call the merge transaction action
    const params = {
        transactionID: mergeTransaction.targetTransactionID,
        transactionIDs: [mergeTransaction.sourceTransactionID],
        created: targetTransaction.created,
        merchant: mergeTransaction.merchant,
        amount: mergeTransaction.amount,
        currency: targetTransaction.currency,
        category: mergeTransaction.category,
        comment: mergeTransaction.description,
        billable: mergeTransaction.billable,
        reimbursable: mergeTransaction.reimbursable,
        tag: mergeTransaction.tag,
        receiptID: mergeTransaction.receipt?.receiptID,
        reportID: targetTransaction.reportID,
    };

    // Optimistic update the target transaction with the new values
    const optimisticTargetTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
        value: {
            merchant: params.merchant,
            category: params.category,
            tag: params.tag,
            comment: {
                comment: params.comment,
            },
            reimbursable: params.reimbursable,
            billable: params.billable,
            // Update receipt if receiptID is provided
            ...(params.receiptID && {
                receipt: {
                    receiptID: params.receiptID,
                },
            }),
        },
    };
    const failureTargetTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
        value: targetTransaction,
    };

    // Optimistic delete the source transaction and also delete its report if it was a single expense report
    const optimisticSourceTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
        value: null,
    };
    const failureSourceTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
        value: sourceTransaction,
    };

    // Optimistic delete the merge transaction
    const optimisticMergeTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`,
        value: null,
    };

    // Optimistic delete duplicated transaction violations
    const optimisticTransactionViolations: OnyxUpdate[] = [targetTransaction.transactionID, sourceTransaction.transactionID].map((id) => {
        const violations = getTransactionViolationsOfTransaction(id);

        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });
    const failureTransactionViolations: OnyxUpdate[] = [targetTransaction.transactionID, sourceTransaction.transactionID].map((id) => {
        const violations = getTransactionViolationsOfTransaction(id);

        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const optimisticData: OnyxUpdate[] = [optimisticTargetTransactionData, optimisticSourceTransactionData, optimisticMergeTransactionData, ...optimisticTransactionViolations];

    const failureData: OnyxUpdate[] = [failureTargetTransactionData, failureSourceTransactionData, ...failureTransactionViolations];

    API.write(WRITE_COMMANDS.MERGE_TRANSACTION, params, {optimisticData, failureData});
}

export {setupMergeTransactionData, setMergeTransactionKey, getTransactionsForMerging, getTransactionsForMergingLocally, mergeTransactionRequest};
