import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, getReportTransactions, isCurrentUserSubmitter, isExpenseReport, isIOUReport, isMoneyRequestReportEligibleForMerge, isReportManager} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {getAmount, getTransactionViolationsOfTransaction, getUpdatedTransaction, isCardTransaction, isTransactionPendingDelete} from '@src/libs/TransactionUtils';
import type {TransactionChanges} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, Report, Transaction} from '@src/types/onyx';

/**
 * Setup merge transaction data for merging flow
 */
function setupMergeTransactionData(transactionID: string, values: Partial<MergeTransaction>) {
    Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, values);
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
function getTransactionsForMergingFromAPI(transactionID: string) {
    const parameters: GetTransactionsForMergingParams = {
        transactionID,
    };

    API.read(READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING, parameters);
}

function areTransactionsEligibleForMerge(transaction1: Transaction, transaction2: Transaction) {
    // Do not allow merging two card transactions
    if (isCardTransaction(transaction1) && isCardTransaction(transaction2)) {
        return false;
    }

    // Do not allow merging two $0 transactions
    if (getAmount(transaction1, false, false) === 0 && getAmount(transaction2, false, false) === 0) {
        return false;
    }

    // Temporary exclude IOU reports from eligible list
    // See: https://github.com/Expensify/App/issues/70329#issuecomment-3277062003
    if (isIOUReport(transaction1.reportID) || isIOUReport(transaction2.reportID)) {
        return false;
    }

    return true;
}

/**
 * Fetches eligible transactions for merging locally
 * This is FE version of READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING API call
 */
function getTransactionsForMergingLocally(transactionID: string, targetTransaction: Transaction, transactions: OnyxCollection<Transaction>) {
    const transactionsArray = Object.values(transactions ?? {});

    const eligibleTransactions = transactionsArray.filter((transaction): transaction is Transaction => {
        if (!transaction || transaction.transactionID === targetTransaction.transactionID) {
            return false;
        }

        const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        return (
            areTransactionsEligibleForMerge(targetTransaction, transaction) &&
            !isTransactionPendingDelete(transaction) &&
            (isUnreportedExpense || (!!transaction.reportID && isMoneyRequestReportEligibleForMerge(transaction.reportID, false)))
        );
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {
        eligibleTransactions,
    });
}

function getTransactionsForMerging({
    isOffline,
    targetTransaction,
    transactions,
    policy,
    report,
    currentUserLogin,
}: {
    isOffline: boolean;
    targetTransaction: Transaction;
    transactions: OnyxCollection<Transaction>;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    currentUserLogin: string | undefined;
}) {
    const transactionID = targetTransaction.transactionID;

    // Collect/Control workspaces:
    // - Admins and approvers: The list of eligible expenses will only contain the expenses from the report that the admin/approver triggered the merge from. This is intentionally limited since they’ll only be reviewing one report at a time.
    // - Submitters will see all their editable expenses, including their IOUs/unreported expenses
    // IOU:
    // - There are no admins/approvers outside of the submitter in these cases, so there’s no consideration for different roles.
    // - The submitter, who is also the admin, will see all their editable expenses, including their IOUs/unreported expenses
    const isAdmin = isPolicyAdmin(policy, currentUserLogin);
    const isManager = isReportManager(report);

    if (isPaidGroupPolicy(policy) && (isAdmin || isManager) && !isCurrentUserSubmitter(report)) {
        const reportTransactions = getReportTransactions(report?.reportID);
        const eligibleTransactions = reportTransactions.filter((transaction): transaction is Transaction => {
            if (!transaction || transaction.transactionID === transactionID) {
                return false;
            }

            return areTransactionsEligibleForMerge(targetTransaction, transaction);
        });

        Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {
            eligibleTransactions,
        });
        return;
    }

    if (isOffline) {
        getTransactionsForMergingLocally(transactionID, targetTransaction, transactions);
    } else {
        getTransactionsForMergingFromAPI(transactionID);
    }
}

function getOptimisticTargetTransactionData(targetTransaction: Transaction, mergeTransaction: MergeTransaction) {
    const {description, ...transactionChanges} = {...mergeTransaction, comment: mergeTransaction.description};

    // Compare mergeTransaction with targetTransaction and remove fields with same values
    const filteredTransactionChanges = Object.fromEntries(
        Object.entries(transactionChanges).filter(([key, mergeValue]) => {
            // Special handling for comment field
            if (key === 'comment') {
                return mergeValue !== targetTransaction.comment?.comment;
            }

            // For all other fields, compare directly
            const targetValue = targetTransaction[key as keyof Transaction];
            return mergeValue !== targetValue;
        }),
    ) as TransactionChanges;

    const targetTransactionUpdated = getUpdatedTransaction({
        transaction: targetTransaction,
        transactionChanges: filteredTransactionChanges,
        isFromExpenseReport: isExpenseReport(mergeTransaction.reportID),
    });

    return targetTransactionUpdated;
}

/**
 * Merges two transactions by updating the target transaction with selected fields and deleting the source transaction
 */
function mergeTransactionRequest(mergeTransactionID: string, mergeTransaction: MergeTransaction, targetTransaction: Transaction, sourceTransaction: Transaction) {
    const isUnreportedExpense = !mergeTransaction.reportID || mergeTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    // If the target transaction we're keeping is unreported, the amount needs to be always negative. Otherwise for expense reports it needs to be the opposite sign.
    const finalAmount = isUnreportedExpense ? -Math.abs(mergeTransaction.amount) : -mergeTransaction.amount;

    // Call the merge transaction action
    const params = {
        transactionID: mergeTransaction.targetTransactionID,
        transactionIDList: [mergeTransaction.sourceTransactionID],
        created: mergeTransaction.created,
        merchant: mergeTransaction.merchant,
        amount: finalAmount,
        currency: mergeTransaction.currency,
        category: mergeTransaction.category,
        comment: mergeTransaction.description,
        billable: mergeTransaction.billable,
        reimbursable: mergeTransaction.reimbursable,
        tag: mergeTransaction.tag,
        receiptID: mergeTransaction.receipt?.receiptID,
        reportID: mergeTransaction.reportID,
    };

    const targetTransactionUpdated = getOptimisticTargetTransactionData(targetTransaction, mergeTransaction);

    // Optimistic update the target transaction with the new values
    const optimisticTargetTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
        value: {
            ...targetTransactionUpdated,
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
    const iouActionOfSourceTransaction = getIOUActionForReportID(sourceTransaction.reportID, sourceTransaction.transactionID);
    const optimisticSourceReportActionData: OnyxUpdate[] = iouActionOfSourceTransaction
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceTransaction.reportID}`,
                  value: {
                      [iouActionOfSourceTransaction.reportActionID]: {
                          pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      },
                  },
              },
          ]
        : [];
    const successSourceReportActionData: OnyxUpdate[] = iouActionOfSourceTransaction
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceTransaction.reportID}`,
                  value: {
                      [iouActionOfSourceTransaction.reportActionID]: {
                          pendingAction: null,
                      },
                  },
              },
          ]
        : [];
    const successData: OnyxUpdate[] = [...successSourceReportActionData];
    const failureSourceReportActionData: OnyxUpdate[] = iouActionOfSourceTransaction
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceTransaction.reportID}`,
                  value: {
                      [iouActionOfSourceTransaction.reportActionID]: {
                          pendingAction: null,
                      },
                  },
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
        ...optimisticSourceReportActionData,
    ];

    const failureData: OnyxUpdate[] = [
        failureTargetTransactionData,
        failureSourceTransactionData,
        ...failureSourceReportData,
        ...failureTransactionViolations,
        ...failureSourceReportActionData,
    ];

    API.write(WRITE_COMMANDS.MERGE_TRANSACTION, params, {optimisticData, failureData, successData});
}

export {setupMergeTransactionData, setMergeTransactionKey, getTransactionsForMerging, mergeTransactionRequest};
