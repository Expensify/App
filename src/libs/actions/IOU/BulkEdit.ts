import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertToBackendAmount, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {hasDependentTags} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticModifiedExpenseReportAction,
    canEditFieldOfMoneyRequest,
    findSelfDMReportID,
    getOutstandingChildRequest,
    getParsedComment,
    getTransactionDetails,
    isExpenseReport,
    isInvoiceReport as isInvoiceReportReportUtils,
    isSelfDM,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {calculateTaxAmount, getAmount, getClearedPendingFields, getCurrency, getTaxValue, getUpdatedTransaction, isOnHold} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {createTransactionThreadReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionChanges} from '@src/types/onyx/Transaction';
import {getAllTransactionViolations, getCurrentUserEmail, getUpdatedMoneyRequestReportData, getUserAccountID} from '.';

function removeUnchangedBulkEditFields(
    transactionChanges: TransactionChanges,
    transaction: OnyxTypes.Transaction,
    baseIOUReport: OnyxEntry<OnyxTypes.Report> | null,
    policy: OnyxEntry<OnyxTypes.Policy>,
): TransactionChanges {
    const iouType = isInvoiceReportReportUtils(baseIOUReport ?? undefined) ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT;
    const allowNegative = shouldEnableNegative(baseIOUReport ?? undefined, policy, iouType);
    const currentDetails = getTransactionDetails(transaction, undefined, policy, allowNegative);
    if (!currentDetails) {
        return transactionChanges;
    }

    const changeKeys = Object.keys(transactionChanges) as Array<keyof TransactionChanges>;
    if (changeKeys.length === 0) {
        return transactionChanges;
    }

    let filteredChanges: TransactionChanges = {};

    for (const field of changeKeys) {
        const nextValue = transactionChanges[field];
        const currentValue = currentDetails[field as keyof TransactionDetails];

        if (nextValue !== currentValue) {
            filteredChanges = {
                ...filteredChanges,
                [field]: nextValue,
            };
        }
    }

    return filteredChanges;
}

type UpdateMultipleMoneyRequestsParams = {
    transactionIDs: string[];
    changes: TransactionChanges;
    policy: OnyxEntry<OnyxTypes.Policy>;
    reports: OnyxCollection<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    reportActions: OnyxCollection<OnyxTypes.ReportActions>;
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>;
    policyTags: OnyxCollection<OnyxTypes.PolicyTagLists>;
    hash?: number;
    allPolicies?: OnyxCollection<OnyxTypes.Policy>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
};

function updateMultipleMoneyRequests({
    transactionIDs,
    changes,
    policy,
    reports,
    transactions,
    reportActions,
    policyCategories,
    policyTags,
    hash,
    allPolicies,
    introSelected,
    betas,
}: UpdateMultipleMoneyRequestsParams) {
    // Track running totals per report so multiple edits in the same report compound correctly.
    const optimisticReportsByID: Record<string, OnyxTypes.Report> = {};
    for (const transactionID of transactionIDs) {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }

        const iouReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`] ?? undefined;
        const baseIouReport = iouReport?.reportID ? (optimisticReportsByID[iouReport.reportID] ?? iouReport) : iouReport;
        const isFromExpenseReport = isExpenseReport(baseIouReport);

        const transactionReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
        let reportAction = getIOUActionForTransactionID(Object.values(transactionReportActions), transactionID);

        // Track expenses created via self DM are stored with reportID = UNREPORTED_REPORT_ID ('0')
        // because they have never been submitted to a report. As a result, the lookup above returns
        // nothing — the IOU action is stored under the self DM report (chat with yourself, unique
        // per user) rather than under transaction.reportID. Without this fallback we cannot resolve
        // the transaction thread, which means no optimistic MODIFIED_EXPENSE comment would be
        // generated during bulk edit for these expenses.
        if (!reportAction && (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID)) {
            const selfDMReportID = findSelfDMReportID(reports);
            if (selfDMReportID) {
                const selfDMReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`] ?? {};
                reportAction = getIOUActionForTransactionID(Object.values(selfDMReportActions), transactionID);
            }
        }

        let transactionThreadReportID = transaction.transactionThreadReportID ?? reportAction?.childReportID;
        let transactionThread = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;

        // Offline-created expenses can be missing a transaction thread until it's opened once.
        // Ensure the thread exists before adding optimistic MODIFIED_EXPENSE actions so
        // bulk-edit comments are visible immediately while still offline.
        let didCreateThreadInThisIteration = false;
        if (!transactionThreadReportID && iouReport?.reportID) {
            const optimisticTransactionThread = createTransactionThreadReport(introSelected, getCurrentUserEmail(), getUserAccountID(), betas, iouReport, reportAction, transaction);
            if (optimisticTransactionThread?.reportID) {
                transactionThreadReportID = optimisticTransactionThread.reportID;
                transactionThread = optimisticTransactionThread;
                didCreateThreadInThisIteration = true;
            }
        }

        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        // Category, tag, tax, and billable only apply to expense/invoice reports and unreported (track) expenses.
        // For plain IOU transactions these fields are not applicable and must be silently skipped.
        const supportsExpenseFields = isUnreportedExpense || isFromExpenseReport || isInvoiceReportReportUtils(baseIouReport ?? undefined);
        // Use the transaction's own policy for all per-transaction checks (permissions, tax, change-diffing).
        // Falls back to the shared bulk-edit policy when the transaction's workspace cannot be resolved.
        const transactionPolicy = (iouReport?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`] : undefined) ?? policy;
        const canEditField = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
            // Unreported (track) expenses have no report, so there is no reportAction to validate against.
            // They are never approved or settled, so all bulk-editable fields are allowed.
            if (isUnreportedExpense) {
                return true;
            }

            return canEditFieldOfMoneyRequest({reportAction, fieldToEdit: field, transaction, report: iouReport, policy: transactionPolicy});
        };

        let transactionChanges: TransactionChanges = {};

        if (changes.merchant && canEditField(CONST.EDIT_REQUEST_FIELD.MERCHANT)) {
            transactionChanges.merchant = changes.merchant;
        }
        if (changes.created && canEditField(CONST.EDIT_REQUEST_FIELD.DATE)) {
            transactionChanges.created = changes.created;
        }
        if (changes.amount !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.AMOUNT)) {
            transactionChanges.amount = changes.amount;
        }
        if (changes.currency && canEditField(CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
            transactionChanges.currency = changes.currency;
        }
        if (changes.category !== undefined && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.CATEGORY)) {
            transactionChanges.category = changes.category;
        }
        if (changes.tag && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.TAG)) {
            transactionChanges.tag = changes.tag;
        }
        if (changes.comment && canEditField(CONST.EDIT_REQUEST_FIELD.DESCRIPTION)) {
            transactionChanges.comment = getParsedComment(changes.comment);
        }
        if (changes.taxCode && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.TAX_RATE)) {
            transactionChanges.taxCode = changes.taxCode;
            const taxValue = getTaxValue(transactionPolicy, transaction, changes.taxCode);
            transactionChanges.taxValue = taxValue;
            const decimals = getCurrencyDecimals(getCurrency(transaction));
            const effectiveAmount = transactionChanges.amount !== undefined ? Math.abs(transactionChanges.amount) : Math.abs(getAmount(transaction));
            const taxAmount = calculateTaxAmount(taxValue, effectiveAmount, decimals);
            transactionChanges.taxAmount = convertToBackendAmount(taxAmount);
        }

        if (changes.billable !== undefined && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.BILLABLE)) {
            transactionChanges.billable = changes.billable;
        }
        if (changes.reimbursable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE)) {
            transactionChanges.reimbursable = changes.reimbursable;
        }

        transactionChanges = removeUnchangedBulkEditFields(transactionChanges, transaction, baseIouReport, transactionPolicy);

        const updates: Record<string, string | number | boolean> = {};
        if (transactionChanges.merchant) {
            updates.merchant = transactionChanges.merchant;
        }
        if (transactionChanges.created) {
            updates.created = transactionChanges.created;
        }
        if (transactionChanges.currency) {
            updates.currency = transactionChanges.currency;
        }
        if (transactionChanges.category !== undefined) {
            updates.category = transactionChanges.category;
        }
        if (transactionChanges.tag) {
            updates.tag = transactionChanges.tag;
        }
        if (transactionChanges.comment) {
            updates.comment = transactionChanges.comment;
        }
        if (transactionChanges.taxCode) {
            updates.taxCode = transactionChanges.taxCode;
        }
        if (transactionChanges.taxValue) {
            updates.taxValue = transactionChanges.taxValue;
        }
        if (transactionChanges.taxAmount !== undefined) {
            updates.taxAmount = transactionChanges.taxAmount;
        }
        if (transactionChanges.amount !== undefined) {
            updates.amount = transactionChanges.amount;
        }
        if (transactionChanges.billable !== undefined) {
            updates.billable = transactionChanges.billable;
        }
        if (transactionChanges.reimbursable !== undefined) {
            updates.reimbursable = transactionChanges.reimbursable;
        }

        // Skip if no updates
        if (Object.keys(updates).length === 0) {
            continue;
        }

        // Generate optimistic report action ID
        const modifiedExpenseReportActionID = NumberUtils.rand64();

        const optimisticData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const successData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const failureData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const snapshotOptimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];
        const snapshotSuccessData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];
        const snapshotFailureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];

        // Pending fields for the transaction
        const pendingFields: OnyxTypes.Transaction['pendingFields'] = Object.fromEntries(Object.keys(transactionChanges).map((field) => [field, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
        const clearedPendingFields = getClearedPendingFields(transactionChanges);

        const errorFields = Object.fromEntries(Object.keys(pendingFields).map((field) => [field, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

        // Build updated transaction
        const updatedTransaction = getUpdatedTransaction({
            transaction,
            transactionChanges,
            isFromExpenseReport,
            policy: transactionPolicy,
        });
        const isTransactionOnHold = isOnHold(transaction);

        // Optimistically update violations so they disappear immediately when the edited field resolves them.
        // Skip for unreported expenses: they have no iouReport context so isSelfDM() returns false,
        // which would incorrectly trigger policy-required violations (e.g. missingCategory).
        let optimisticViolationsData: ReturnType<typeof ViolationsUtils.getViolationsOnyxData> | undefined;
        let currentTransactionViolations: OnyxTypes.TransactionViolation[] | undefined;
        if (transactionPolicy && !isUnreportedExpense) {
            currentTransactionViolations = getAllTransactionViolations()[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            let optimisticViolations =
                transactionChanges.amount !== undefined || transactionChanges.created || transactionChanges.currency
                    ? currentTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
                    : currentTransactionViolations;
            optimisticViolations =
                transactionChanges.category !== undefined && transactionChanges.category === ''
                    ? optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY)
                    : optimisticViolations;
            const transactionPolicyTagList = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${transactionPolicy?.id}`] ?? {};
            const transactionPolicyCategories = policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${transactionPolicy?.id}`] ?? {};
            optimisticViolationsData = ViolationsUtils.getViolationsOnyxData(
                updatedTransaction,
                optimisticViolations,
                transactionPolicy,
                transactionPolicyTagList,
                transactionPolicyCategories,
                hasDependentTags(transactionPolicy, transactionPolicyTagList),
                isInvoiceReportReportUtils(iouReport),
                isSelfDM(iouReport),
                iouReport,
                isFromExpenseReport,
            );
            optimisticData.push(optimisticViolationsData);
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: currentTransactionViolations,
            });
        }

        // Optimistic transaction update
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...updatedTransaction,
                pendingFields,
                isLoading: false,
                errorFields: null,
            },
        });

        // Optimistically update the search snapshot so the search list reflects the
        // new values immediately (the snapshot is the exclusive data source for search
        // result rendering and is not automatically updated by the TRANSACTION write above).
        if (hash) {
            snapshotOptimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                            ...updatedTransaction,
                            pendingFields,
                        },
                        ...(optimisticViolationsData && {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: optimisticViolationsData.value}),
                    },
                },
            });
            snapshotSuccessData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const,
                value: {
                    data: {
                        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {pendingFields: clearedPendingFields},
                    },
                },
            });
            snapshotFailureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                            ...transaction,
                            pendingFields: clearedPendingFields,
                        },
                        ...(currentTransactionViolations && {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: currentTransactionViolations}),
                    },
                },
            });
        }

        // To build proper offline update message, we need to include the currency
        const optimisticTransactionChanges =
            transactionChanges?.amount !== undefined && !transactionChanges?.currency ? {...transactionChanges, currency: getCurrency(transaction)} : transactionChanges;

        // Build optimistic modified expense report action
        const optimisticReportAction = buildOptimisticModifiedExpenseReportAction(
            transactionThread,
            transaction,
            optimisticTransactionChanges,
            isFromExpenseReport,
            transactionPolicy,
            updatedTransaction,
        );

        const {updatedMoneyRequestReport, isTotalIndeterminate} = getUpdatedMoneyRequestReportData(
            baseIouReport,
            updatedTransaction,
            transaction,
            isTransactionOnHold,
            transactionPolicy,
            optimisticReportAction?.actorAccountID,
            transactionChanges,
        );

        if (updatedMoneyRequestReport) {
            if (updatedMoneyRequestReport.reportID) {
                optimisticReportsByID[updatedMoneyRequestReport.reportID] = updatedMoneyRequestReport;
            }
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    value: {...updatedMoneyRequestReport, ...(isTotalIndeterminate && {pendingFields: {total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}})},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
                    value: getOutstandingChildRequest(updatedMoneyRequestReport),
                },
            );
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {pendingAction: null, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {...iouReport, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
            });
        }

        // Optimistic report action
        let backfilledCreatedActionID: string | undefined;
        if (transactionThreadReportID) {
            // Backfill a CREATED action for threads never opened locally so
            // MoneyRequestView renders and the skeleton doesn't loop offline.
            // Skip when the thread was just created above (openReport handles it).
            const threadReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {};
            const hasCreatedAction = didCreateThreadInThisIteration || Object.values(threadReportActions).some((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
            const optimisticCreatedValue: Record<string, Partial<OnyxTypes.ReportAction>> = {};
            if (!hasCreatedAction) {
                const optimisticCreatedAction = buildOptimisticCreatedReportAction(CONST.REPORT.OWNER_EMAIL_FAKE);
                optimisticCreatedAction.pendingAction = null;
                backfilledCreatedActionID = optimisticCreatedAction.reportActionID;
                optimisticCreatedValue[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
            }

            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    ...optimisticCreatedValue,
                    [modifiedExpenseReportActionID]: {
                        ...optimisticReportAction,
                        reportActionID: modifiedExpenseReportActionID,
                    },
                },
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastReadTime: optimisticReportAction.created,
                    reportID: transactionThreadReportID,
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastReadTime: transactionThread?.lastReadTime,
                },
            });
        }

        // Success data - clear pending fields
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: clearedPendingFields,
            },
        });

        if (transactionThreadReportID) {
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [modifiedExpenseReportActionID]: {pendingAction: null},
                    // Remove the backfilled CREATED action so it doesn't duplicate one from OpenReport
                    ...(backfilledCreatedActionID ? {[backfilledCreatedActionID]: null} : {}),
                },
            });
        }

        // Failure data - revert transaction
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...transaction,
                pendingFields: clearedPendingFields,
                errorFields,
            },
        });

        // Failure data - remove optimistic report action
        if (transactionThreadReportID) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [modifiedExpenseReportActionID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                    },
                    ...(backfilledCreatedActionID ? {[backfilledCreatedActionID]: null} : {}),
                },
            });
        }

        const params = {
            transactionID,
            reportActionID: modifiedExpenseReportActionID,
            updates: JSON.stringify(updates),
        };

        API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST, params, {
            optimisticData: [...optimisticData, ...snapshotOptimisticData] as Array<
                OnyxUpdate<
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
                    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
                    | typeof ONYXKEYS.COLLECTION.REPORT
                    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                >
            >,
            successData: [...successData, ...snapshotSuccessData] as Array<
                OnyxUpdate<
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
                    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
                    | typeof ONYXKEYS.COLLECTION.REPORT
                    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                >
            >,
            failureData: [...failureData, ...snapshotFailureData] as Array<
                OnyxUpdate<
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
                    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
                    | typeof ONYXKEYS.COLLECTION.REPORT
                    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                >
            >,
        });
    }
}

/**
 * Initializes the bulk-edit draft transaction under one fixed placeholder ID.
 * We keep a single draft in Onyx to store the shared edits for a multi-select,
 * then apply those edits to each real transaction later. The placeholder ID is
 * just the storage key and never equals any actual transactionID.
 */
function initBulkEditDraftTransaction(selectedTransactionIDs: string[]) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {
        transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
        selectedTransactionIDs,
    });
}

/**
 * Clears the draft transaction used for bulk editing
 */
function clearBulkEditDraftTransaction() {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, null);
}

/**
 * Updates the draft transaction for bulk editing multiple expenses
 */
function updateBulkEditDraftTransaction(transactionChanges: NullishDeep<OnyxTypes.Transaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, transactionChanges);
}

export {removeUnchangedBulkEditFields, updateMultipleMoneyRequests, initBulkEditDraftTransaction, clearBulkEditDraftTransaction, updateBulkEditDraftTransaction};
export type {UpdateMultipleMoneyRequestsParams};
