import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getReportOrDraftReport, getReportTransactions, isMoneyRequestReportEligibleForMerge, isReportManager} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {getTransactionViolationsOfTransaction, isCardTransaction} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, Report, Transaction} from '@src/types/onyx';

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

function areTransactionsEligibleForMerge(transaction1: Transaction, transaction2: Transaction) {
    // If the supplied transaction is from a card, return only cash expenses
    if (isCardTransaction(transaction1) && isCardTransaction(transaction2)) {
        return false;
    }

    return true;
}

/**
 * Fetches eligible transactions for merging locally
 * This is FE version of READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING API call
 */

function getTransactionsForMergingLocally(
    targetTransactionID: string,
    transactions: OnyxCollection<Transaction>,
    policy: OnyxEntry<Policy>,
    report: OnyxEntry<Report>,
    currentUserLogin: string | undefined,
) {
    const transactionsArray = Object.values(transactions ?? {});
    const targetTransaction = transactionsArray.find((transaction) => transaction?.transactionID === targetTransactionID);
    const isAdmin = isPolicyAdmin(policy, currentUserLogin);
    const isManager = isReportManager(report);

    let eligibleTransactions: Transaction[] = [];

    // In phase 1:
    // for managers and admins: we have decided to only return transaction from the target transaction report;
    // for submitter: can see all transactions that you're also a submitter
    if (!targetTransaction) {
        eligibleTransactions = [];
    } else if (isAdmin || isManager) {
        const reportTransactions = getReportTransactions(report?.reportID);
        eligibleTransactions = reportTransactions.filter((transaction): transaction is Transaction => {
            if (!transaction || transaction.transactionID === targetTransactionID || !transaction.reportID) {
                return false;
            }
            return areTransactionsEligibleForMerge(targetTransaction, transaction);
        });
    } else {
        eligibleTransactions = transactionsArray.filter((transaction): transaction is Transaction => {
            if (!transaction || transaction.transactionID === targetTransactionID || !transaction.reportID) {
                return false;
            }

            const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            return areTransactionsEligibleForMerge(targetTransaction, transaction) && (isUnreportedExpense || isMoneyRequestReportEligibleForMerge(transaction.reportID, false));
        });
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${targetTransactionID}`, {
        eligibleTransactions,
    });
}

/**
 * Merges two transactions by updating the target transaction with selected fields and deleting the source transaction
 */
function mergeTransactionRequest(mergeTransactionID: string, mergeTransaction: MergeTransaction, targetTransaction: Transaction, sourceTransaction: Transaction) {
    const isUnreportedExpense = !targetTransaction.reportID || targetTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    // If the target transaction we're keeping is unreported, the amount needs to be positive. Otherwise for expense reports it needs to be the opposite sign.
    const finalAmount = isUnreportedExpense ? Math.abs(mergeTransaction.amount) : -mergeTransaction.amount;

    // Call the merge transaction action
    const params = {
        transactionID: mergeTransaction.targetTransactionID,
        transactionIDList: [mergeTransaction.sourceTransactionID],
        created: targetTransaction.created,
        merchant: mergeTransaction.merchant,
        amount: finalAmount,
        currency: mergeTransaction.currency,
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
                    source: mergeTransaction.receipt?.source ?? targetTransaction.receipt?.source,
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
    const transactionsOfSourceReport = getReportTransactions(sourceTransaction.reportID);
    const optimisticSourceReportData: OnyxUpdate[] =
        transactionsOfSourceReport.length === 1
            ? [
                  {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction.reportID}`,
                      value: null,
                  },
              ]
            : [];

    const failureSourceReportData: OnyxUpdate[] =
        transactionsOfSourceReport.length === 1
            ? [
                  {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction.reportID}`,
                      value: getReportOrDraftReport(sourceTransaction.reportID),
                  },
              ]
            : [];

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

    const optimisticData: OnyxUpdate[] = [
        optimisticTargetTransactionData,
        optimisticSourceTransactionData,
        ...optimisticSourceReportData,
        optimisticMergeTransactionData,
        ...optimisticTransactionViolations,
    ];

    const failureData: OnyxUpdate[] = [failureTargetTransactionData, failureSourceTransactionData, ...failureSourceReportData, ...failureTransactionViolations];

    API.write(WRITE_COMMANDS.MERGE_TRANSACTION, params, {optimisticData, failureData});
}

export {setupMergeTransactionData, setMergeTransactionKey, getTransactionsForMerging, getTransactionsForMergingLocally, mergeTransactionRequest};
