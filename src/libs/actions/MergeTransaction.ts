import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxMergeInput, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMergeFieldValue, getTransactionThreadReportID, MERGE_FIELDS} from '@libs/MergeTransactionUtils';
import type {MergeFieldKey, MergeTransactionUpdateValues} from '@libs/MergeTransactionUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage} from '@libs/ReportActionsUtils';
import {
    buildOptimisticIOUReportAction,
    getReportOrDraftReport,
    getReportTransactions,
    getTransactionDetails,
    isCurrentUserSubmitter,
    isExpenseReport,
    isIOUReport,
    isMoneyRequestReportEligibleForMerge,
    isReportManager,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {
    getAmount,
    getTransactionViolationsOfTransaction,
    isDistanceRequest,
    isExpenseSplit,
    isManagedCardTransaction,
    isPerDiemRequest,
    isTransactionPendingDelete,
} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, PolicyCategories, PolicyTagLists, Report, Transaction} from '@src/types/onyx';
import {rand64} from '@libs/NumberUtils';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import {getUpdateMoneyRequestParams, getUpdateTrackExpenseParams} from './IOU';
import type {UpdateMoneyRequestData} from './IOU';

/**
 * Setup merge transaction data for merging flow
 */
function setupMergeTransactionData(transactionID: string, values: Partial<MergeTransaction>) {
    Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, values);
}

/**
 * Sets merge transaction data for a specific transaction
 */
function setMergeTransactionKey(transactionID: string, values: MergeTransactionUpdateValues) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, values as OnyxMergeInput<`${typeof ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${string}`>);
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

function areTransactionsEligibleForMerge(transaction1: Transaction, transaction2: Transaction, originalTransaction1?: Transaction, originalTransaction2?: Transaction) {
    // Do not allow merging two card transactions
    if (isManagedCardTransaction(transaction1) && isManagedCardTransaction(transaction2)) {
        return false;
    }

    // Do not allow merging two split expenses
    if (isExpenseSplit(transaction1, originalTransaction1) && isExpenseSplit(transaction2, originalTransaction2)) {
        return false;
    }

    // Do not allow merging two $0 transactions
    if (getAmount(transaction1, false, false) === 0 && getAmount(transaction2, false, false) === 0) {
        return false;
    }

    // Do not allow merging a per diem and a card transaction
    if ((isPerDiemRequest(transaction1) && isManagedCardTransaction(transaction2)) || (isPerDiemRequest(transaction2) && isManagedCardTransaction(transaction1))) {
        return false;
    }

    // Temporary exclude IOU reports from eligible list
    // See: https://github.com/Expensify/App/issues/70329#issuecomment-3277062003
    if (isIOUReport(transaction1.reportID) || isIOUReport(transaction2.reportID)) {
        return false;
    }

    if (isDistanceRequest(transaction1) !== isDistanceRequest(transaction2)) {
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
    const targetOriginalTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction?.comment?.originalTransactionID}`];

    const eligibleTransactions = transactionsArray.filter((transaction): transaction is Transaction => {
        if (!transaction || transaction.transactionID === targetTransaction.transactionID) {
            return false;
        }

        const originalTransactionID = transaction.comment?.originalTransactionID;
        const originalTransaction = originalTransactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`] : undefined;
        const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        return (
            areTransactionsEligibleForMerge(targetTransaction, transaction, targetOriginalTransaction, originalTransaction) &&
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
        const targetOriginalTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction?.comment?.originalTransactionID}`];
        const eligibleTransactions = reportTransactions.filter((transaction): transaction is Transaction => {
            if (!transaction || transaction.transactionID === transactionID) {
                return false;
            }

            const originalTransactionID = transaction.comment?.originalTransactionID;
            const originalTransaction = originalTransactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`] : undefined;
            return areTransactionsEligibleForMerge(targetTransaction, transaction, targetOriginalTransaction, originalTransaction);
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

function getOnyxTargetTransactionData(
    targetTransaction: Transaction,
    mergeTransaction: MergeTransaction,
    policy: OnyxEntry<Policy>,
    policyTags: OnyxEntry<PolicyTagLists>,
    policyCategories: OnyxEntry<PolicyCategories>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    isASAPSubmitBetaEnabled: boolean,
) {
    let data: UpdateMoneyRequestData;
    const isUnreportedExpense = !mergeTransaction.reportID || mergeTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const transactionThreadReportID = getTransactionThreadReportID(targetTransaction);
    const violations = getTransactionViolationsOfTransaction(targetTransaction.transactionID);

    // Compare mergeTransaction with targetTransaction and remove fields with same values
    const targetTransactionDetails = getTransactionDetails(targetTransaction);
    const filteredTransactionChanges = Object.fromEntries(
        Object.entries(mergeTransaction).filter(([key, mergeValue]) => {
            if (!(MERGE_FIELDS as readonly string[]).includes(key)) {
                return false;
            }

            const targetValue = getMergeFieldValue(targetTransactionDetails, targetTransaction, key as MergeFieldKey);

            return !deepEqual(mergeValue, targetValue);
        }),
    );
    filteredTransactionChanges.comment = filteredTransactionChanges.description;
    const shouldBuildOptimisticModifiedExpenseReportAction = false;

    const newTransactionReportID = filteredTransactionChanges.reportID as string | undefined;
    const transactionChangesWithoutReportID = {...filteredTransactionChanges};
    delete transactionChangesWithoutReportID.reportID;

    if (isUnreportedExpense) {
        data = getUpdateTrackExpenseParams(targetTransaction.transactionID, transactionThreadReportID, transactionChangesWithoutReportID, policy, shouldBuildOptimisticModifiedExpenseReportAction);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: targetTransaction.transactionID,
            transactionThreadReportID,
            transactionChanges: transactionChangesWithoutReportID,
            policy,
            policyTagList: policyTags,
            policyCategories,
            violations,
            newTransactionReportID,
            shouldBuildOptimisticModifiedExpenseReportAction,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
        });
    }

    const onyxData = data.onyxData;

    onyxData.optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
        value: {
            receipt: mergeTransaction.receipt ?? null,
        },
    });

    // getUpdateMoneyRequestParams currently derives optimistic distance data from transaction.routes.
    // In the merge flow, the selected merchant determines waypoints/customUnit => we can optimistic distance data from the selected merchant's waypoints/customUnit instead of transaction.routes
    if (isDistanceRequest(targetTransaction)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
            value: {
                comment: {
                    waypoints: mergeTransaction.waypoints ?? null,
                    customUnit: mergeTransaction.customUnit ?? null,
                },
                routes: mergeTransaction.routes ?? null,
                iouRequestType: mergeTransaction.iouRequestType ?? null,
            },
        });
    }

    return onyxData;
}

type MergeTransactionRequestParams = {
    mergeTransactionID: string;
    mergeTransaction: MergeTransaction;
    targetTransaction: Transaction;
    sourceTransaction: Transaction;
    policy: OnyxEntry<Policy>;
    policyTags: OnyxEntry<PolicyTagLists>;
    policyCategories: OnyxEntry<PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
};
/**
 * Merges two transactions by updating the target transaction with selected fields and deleting the source transaction
 */
function mergeTransactionRequest({
    mergeTransactionID,
    mergeTransaction,
    targetTransaction,
    sourceTransaction,
    policy,
    policyTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
}: MergeTransactionRequestParams) {
    const reportIDChanged = mergeTransaction.reportID && mergeTransaction.reportID !== targetTransaction.reportID;

    // For both unreported expenses and expense reports, negate the display amount when storing
    // This preserves the user's chosen sign while following the storage convention
    const finalAmount = -mergeTransaction.amount;

    // Call the merge transaction action
    const params = {
        transactionID: mergeTransaction.targetTransactionID,
        transactionIDList: [mergeTransaction.sourceTransactionID],
        created: mergeTransaction.created,
        merchant: mergeTransaction.merchant,
        amount: finalAmount,
        currency: mergeTransaction.currency,
        category: mergeTransaction.category,
        comment: JSON.stringify({
            ...targetTransaction.comment,
            comment: mergeTransaction.description,
            customUnit: mergeTransaction.customUnit,
            waypoints: mergeTransaction.waypoints ?? null,
            attendees: mergeTransaction.attendees,
            originalTransactionID: mergeTransaction.originalTransactionID,
        }),
        billable: mergeTransaction.billable,
        reimbursable: mergeTransaction.reimbursable,
        tag: mergeTransaction.tag,
        receiptID: mergeTransaction.receipt?.receiptID,
        reportID: mergeTransaction.reportID,
    };

    const onyxTargetTransactionData = getOnyxTargetTransactionData(
        targetTransaction,
        mergeTransaction,
        policy,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
    );

    // Optimistic delete the source transaction and also delete its report if it was a single expense report
    // First set reportID to null so derived value can remove it from source report, then delete it
    const optimisticSourceTransactionData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
            value: {
                reportID: null,
            },
        },
        {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
        value: null,
        },
    ];
    const failureSourceTransactionData: OnyxUpdate[] = [
        {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
        value: sourceTransaction,
        },
    ];
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

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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

    // If reportID changed during merge, create optimistic IOU action for target report
    // This ensures the target report has a report action to display the transaction
    const optimisticTargetReportActionData: OnyxUpdate[] = [];
    const successTargetReportActionData: OnyxUpdate[] = [];
    const failureTargetReportActionData: OnyxUpdate[] = [];

    if (reportIDChanged && mergeTransaction.reportID) {
        const transactionThreadReportID = getTransactionThreadReportID(targetTransaction);
        const transactionThreadReport = transactionThreadReportID ? getReportOrDraftReport(transactionThreadReportID) : null;
        const oldReportIDForIOUAction = transactionThreadReport?.parentReportID ?? targetTransaction.reportID;

        const oldIOUAction = getIOUActionForReportID(oldReportIDForIOUAction, targetTransaction.transactionID);
        const optimisticMoneyRequestReportActionID = rand64();
        let newIOUAction;

        const targetReport = getReportOrDraftReport(mergeTransaction.reportID);
        const isTargetExpenseReport = isExpenseReport(targetReport);
        const reportIDForIOUAction = isTargetExpenseReport && targetReport?.parentReportID ? targetReport.parentReportID : mergeTransaction.reportID;

        if (oldIOUAction) {
            const originalMessage = getOriginalMessage(oldIOUAction) as OriginalMessageIOU;
            const isUnreportedExpense = targetTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || !targetTransaction.reportID;
            newIOUAction = {
                ...oldIOUAction,
                originalMessage: {
                    ...originalMessage,
                    IOUReportID: mergeTransaction.reportID,
                    type: isUnreportedExpense ? CONST.IOU.REPORT_ACTION_TYPE.TRACK : CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                reportActionID: optimisticMoneyRequestReportActionID,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: oldIOUAction?.created ?? DateUtils.getDBTime(),
            };
        } else {
            const transactionAmount = getAmount(targetTransaction, false, false);
            const transactionCurrency = targetTransaction.currency ?? CONST.CURRENCY.USD;
            const transactionComment = targetTransaction.comment?.comment ?? mergeTransaction.description ?? '';

            newIOUAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: Math.abs(transactionAmount),
                currency: transactionCurrency,
                comment: transactionComment,
                participants: [],
                transactionID: targetTransaction.transactionID,
                isOwnPolicyExpenseChat: false,
                reportActionID: optimisticMoneyRequestReportActionID,
                iouReportID: mergeTransaction.reportID,
            });

            newIOUAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
            newIOUAction.actionName = CONST.REPORT.ACTIONS.TYPE.IOU;
        }

        optimisticTargetReportActionData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDForIOUAction}`,
            value: {
                [newIOUAction.reportActionID]: newIOUAction,
            },
        });

        successTargetReportActionData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDForIOUAction}`,
            value: {
                [newIOUAction.reportActionID]: {pendingAction: null},
            },
        });

        failureTargetReportActionData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDForIOUAction}`,
            value: {
                [newIOUAction.reportActionID]: null,
            },
        });

        if (oldIOUAction && oldReportIDForIOUAction && oldReportIDForIOUAction !== reportIDForIOUAction) {
            optimisticTargetReportActionData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldReportIDForIOUAction}`,
                value: {
                    [oldIOUAction.reportActionID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            });

            successTargetReportActionData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldReportIDForIOUAction}`,
                value: {
                    [oldIOUAction.reportActionID]: {pendingAction: null},
                },
            });

            failureTargetReportActionData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldReportIDForIOUAction}`,
                value: {
                    [oldIOUAction.reportActionID]: null,
                },
            });

        }
    }

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const optimisticData: OnyxUpdate[] = [
        ...(onyxTargetTransactionData.optimisticData ?? []),
        ...optimisticTargetReportActionData,
        ...optimisticSourceTransactionData,
        ...optimisticSourceReportData,
        optimisticMergeTransactionData,
        ...optimisticTransactionViolations,
        ...optimisticSourceReportActionData,
    ];

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const failureData: OnyxUpdate[] = [
        ...(onyxTargetTransactionData.failureData ?? []),
        ...failureSourceTransactionData,
        ...failureSourceReportData,
        ...failureTransactionViolations,
        ...failureSourceReportActionData,
        ...failureTargetReportActionData,
    ];

    const successData: OnyxUpdate[] = [];
    successData.push(...successSourceReportActionData);
    successData.push(...(onyxTargetTransactionData.successData ?? []));
    successData.push(...successTargetReportActionData);

    API.write(WRITE_COMMANDS.MERGE_TRANSACTION, params, {optimisticData, failureData, successData});
}

export {areTransactionsEligibleForMerge, setupMergeTransactionData, setMergeTransactionKey, getTransactionsForMerging, mergeTransactionRequest};
