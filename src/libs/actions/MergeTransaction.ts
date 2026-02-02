import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxMergeInput, OnyxUpdate} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {GetTransactionsForMergingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {
    areTransactionsEligibleForMerge,
    getMergeableDataAndConflictFields,
    getMergeFieldValue,
    MERGE_FIELDS,
    selectTargetAndSourceTransactionsForMerge,
    shouldNavigateToReceiptReview,
} from '@libs/MergeTransactionUtils';
import type {MergeFieldKey, MergeTransactionUpdateValues} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, getReportTransactions, isCurrentUserSubmitter, isMoneyRequestReportEligibleForMerge, isReportManager} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {isDistanceRequest, isTransactionPendingDelete} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CardList, MergeTransaction, Policy, PolicyCategories, PolicyTagLists, Report, ReportNextStepDeprecated, Transaction, TransactionViolations} from '@src/types/onyx';
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

function setupMergeTransactionDataAndNavigate(
    navigationTransactionID: string,
    transactions: Transaction[],
    localeCompare: LocaleContextProps['localeCompare'],
    searchReports?: Report[],
    isSelectingSourceTransaction?: boolean,
    isOnSearch?: boolean,
) {
    if (!transactions.length || transactions.length > 2) {
        return;
    }

    if (transactions.length === 1) {
        const transaction = transactions.at(0);
        if (transaction) {
            setupMergeTransactionData(navigationTransactionID, {targetTransactionID: transaction.transactionID});
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_LIST_PAGE.getRoute(transaction.transactionID, Navigation.getActiveRoute(), isOnSearch));
            return;
        }
    }

    const {targetTransaction, sourceTransaction} = selectTargetAndSourceTransactionsForMerge(transactions.at(0), transactions.at(1));
    if (!targetTransaction || !sourceTransaction) {
        return;
    }

    const setupData = {targetTransactionID: targetTransaction?.transactionID, sourceTransactionID: sourceTransaction?.transactionID};
    if (isSelectingSourceTransaction) {
        setMergeTransactionKey(navigationTransactionID, setupData);
    } else {
        setupMergeTransactionData(navigationTransactionID, setupData);
    }
    if (shouldNavigateToReceiptReview([targetTransaction, sourceTransaction])) {
        // Navigate to the receipt review page if both transactions have a receipt
        Navigation.navigate(ROUTES.MERGE_TRANSACTION_RECEIPT_PAGE.getRoute(navigationTransactionID, Navigation.getActiveRoute(), isOnSearch));
    } else {
        const receipt = targetTransaction.receipt?.receiptID ? targetTransaction.receipt : sourceTransaction.receipt;
        if (receipt) {
            setMergeTransactionKey(navigationTransactionID, {receipt});
        }

        // If transactions are identical, skip to the confirmation page
        const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, localeCompare, searchReports);
        if (!conflictFields.length) {
            // If there are no conflict fields, we should set mergeable data and navigate to the confirmation page
            setMergeTransactionKey(navigationTransactionID, mergeableData);
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(navigationTransactionID, Navigation.getActiveRoute(), isOnSearch));
            return;
        }

        Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(navigationTransactionID, Navigation.getActiveRoute(), isOnSearch));
    }
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

/**
 * Fetches eligible transactions for merging locally
 * This is FE version of READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING API call
 */
function getTransactionsForMergingLocally(transactionID: string, targetTransaction: Transaction, transactions: OnyxCollection<Transaction>, isAdmin = false) {
    const transactionsArray = Object.values(transactions ?? {});

    const eligibleTransactions = transactionsArray.filter((transaction): transaction is Transaction => {
        if (!transaction || transaction.transactionID === targetTransaction.transactionID) {
            return false;
        }

        const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        return (
            areTransactionsEligibleForMerge(targetTransaction, transaction) &&
            !isTransactionPendingDelete(transaction) &&
            (isUnreportedExpense || (!!transaction.reportID && isMoneyRequestReportEligibleForMerge(transaction.reportID, isAdmin)))
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
    cardList?: CardList;
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
        getTransactionsForMergingLocally(transactionID, targetTransaction, transactions, isAdmin);
    } else {
        getTransactionsForMergingFromAPI(transactionID);
    }
}

function getOnyxTargetTransactionData({
    targetTransaction,
    targetTransactionViolations,
    mergeTransaction,
    targetTransactionThreadReport,
    targetTransactionThreadParentReport,
    targetTransactionThreadParentReportNextStep,
    policy,
    policyTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
}: {
    targetTransaction: Transaction;
    targetTransactionViolations: OnyxEntry<TransactionViolations>;
    mergeTransaction: MergeTransaction;
    targetTransactionThreadReport: OnyxEntry<Report>;
    targetTransactionThreadParentReport: OnyxEntry<Report>;
    targetTransactionThreadParentReportNextStep: OnyxEntry<ReportNextStepDeprecated>;
    policy: OnyxEntry<Policy>;
    policyTags: OnyxEntry<PolicyTagLists>;
    policyCategories: OnyxEntry<PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
}) {
    let data: UpdateMoneyRequestData;
    const isUnreportedExpense = !mergeTransaction.reportID || mergeTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    // Compare mergeTransaction with targetTransaction and remove fields with same values
    const filteredTransactionChanges = Object.fromEntries(
        Object.entries(mergeTransaction).filter(([key, mergeValue]) => {
            if (!(MERGE_FIELDS as readonly string[]).includes(key)) {
                return false;
            }

            const targetValue = getMergeFieldValue(targetTransaction, key as MergeFieldKey);

            return !deepEqual(mergeValue, targetValue);
        }),
    );
    filteredTransactionChanges.comment = filteredTransactionChanges.description;
    const shouldBuildOptimisticModifiedExpenseReportAction = false;

    if (isUnreportedExpense) {
        data = getUpdateTrackExpenseParams(
            targetTransaction.transactionID,
            targetTransactionThreadReport?.reportID,
            filteredTransactionChanges,
            policy,
            shouldBuildOptimisticModifiedExpenseReportAction,
        );
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: targetTransaction.transactionID,
            transactionThreadReport: targetTransactionThreadReport,
            iouReport: targetTransactionThreadParentReport,
            iouReportNextStep: targetTransactionThreadParentReportNextStep,
            transactionChanges: filteredTransactionChanges,
            policy,
            policyTagList: policyTags,
            policyCategories,
            violations: targetTransactionViolations ?? [],
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
    allTransactionViolations: OnyxCollection<TransactionViolations>;
    sourceTransaction: Transaction;
    targetTransactionThreadReport: OnyxEntry<Report>;
    targetTransactionThreadParentReport: OnyxEntry<Report>;
    targetTransactionThreadParentReportNextStep: OnyxEntry<ReportNextStepDeprecated>;
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
    targetTransactionThreadReport,
    targetTransactionThreadParentReport,
    targetTransactionThreadParentReportNextStep,
    allTransactionViolations,
    policy,
    policyTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
}: MergeTransactionRequestParams) {
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

    const onyxTargetTransactionData = getOnyxTargetTransactionData({
        targetTransaction,
        targetTransactionViolations: allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + targetTransaction.transactionID] ?? [],
        mergeTransaction,
        targetTransactionThreadReport,
        targetTransactionThreadParentReport,
        targetTransactionThreadParentReportNextStep,
        policy,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
    });

    // Optimistic delete the source transaction and also delete its report if it was a single expense report
    const optimisticSourceTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
        value: null,
    };
    const failureSourceTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
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
    const optimisticMergeTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.MERGE_TRANSACTION> = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`,
        value: null,
    };

    // Optimistic delete duplicated transaction violations
    const optimisticTransactionViolations: OnyxUpdate[] = [targetTransaction.transactionID, sourceTransaction.transactionID].map((id) => {
        const violations = allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + id] ?? [];

        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });
    const failureTransactionViolations: OnyxUpdate[] = [targetTransaction.transactionID, sourceTransaction.transactionID].map((id) => {
        const violations = allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + id] ?? [];

        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const optimisticData: OnyxUpdate[] = [
        ...(onyxTargetTransactionData.optimisticData ?? []),
        optimisticSourceTransactionData,
        ...optimisticSourceReportData,
        optimisticMergeTransactionData,
        ...optimisticTransactionViolations,
        ...optimisticSourceReportActionData,
    ];

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const failureData: OnyxUpdate[] = [
        ...(onyxTargetTransactionData.failureData ?? []),
        failureSourceTransactionData,
        ...failureSourceReportData,
        ...failureTransactionViolations,
        ...failureSourceReportActionData,
    ];

    const successData: OnyxUpdate[] = [];
    successData.push(...successSourceReportActionData);
    successData.push(...(onyxTargetTransactionData.successData ?? []));

    API.write(WRITE_COMMANDS.MERGE_TRANSACTION, params, {optimisticData, failureData, successData});
}

export {areTransactionsEligibleForMerge, setupMergeTransactionData, setupMergeTransactionDataAndNavigate, setMergeTransactionKey, getTransactionsForMerging, mergeTransactionRequest};
