/**
 * Actions for inline editing of transactions from the Search results table and the Expense Report page.
 *
 * Each function optionally updates the search snapshot entry (when a hash is provided) so the row
 * reflects the new value immediately, then delegates to the corresponding IOU action which owns
 * the canonical Onyx record, the API write, and failure rollback.
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {getTagLists, isMultiLevelTags} from '@libs/PolicyUtils';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, canEditMoneyRequest, canUserPerformWriteAction, isArchivedReport, isReportIDApproved, isSettled} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {isExpenseUnreported, isScanning} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    Policy,
    PolicyCategories,
    PolicyTagLists,
    RecentlyUsedCategories,
    RecentlyUsedTags,
    Report,
    ReportAction,
    ReportNameValuePairs,
    ReportNextStepDeprecated,
    SearchResults,
    Transaction,
    TransactionViolations,
} from '@src/types/onyx';
import {
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestCategory,
    updateMoneyRequestDate,
    updateMoneyRequestDescription,
    updateMoneyRequestMerchant,
    updateMoneyRequestTag,
} from './IOU';

type TransactionEditPermissions = {
    canEditDate: boolean;
    canEditMerchant: boolean;
    canEditDescription: boolean;
    canEditCategory: boolean;
    canEditAmount: boolean;
    canEditTag: boolean;
};

let allTransactions: NonNullable<OnyxCollection<Transaction>> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactions = value ?? {};
    },
});

let allTransactionViolations: NonNullable<OnyxCollection<TransactionViolations>> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionViolations = value ?? {};
    },
});

let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicies = value;
    },
});

let allPolicyTags: OnyxCollection<PolicyTagLists> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyTags = value ?? {};
    },
});

let allPolicyCategories: OnyxCollection<PolicyCategories>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyCategories = value;
    },
});

let allPolicyRecentlyUsedCategories: OnyxCollection<RecentlyUsedCategories>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyRecentlyUsedCategories = value;
    },
});

let allPolicyRecentlyUsedTags: OnyxCollection<RecentlyUsedTags> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyRecentlyUsedTags = value ?? {};
    },
});

let allNextSteps: OnyxCollection<ReportNextStepDeprecated>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.NEXT_STEP,
    waitForCollectionCallback: true,
    callback: (value) => {
        allNextSteps = value;
    },
});

let currentUserAccountID: number = CONST.DEFAULT_NUMBER_ID;
let currentUserEmail = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let allBetas: Beta[] | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => {
        allBetas = value ?? undefined;
    },
});

const NO_EDIT: Readonly<TransactionEditPermissions> = Object.freeze({
    canEditDate: false,
    canEditMerchant: false,
    canEditDescription: false,
    canEditCategory: false,
    canEditAmount: false,
    canEditTag: false,
});

type TransactionEditPermissionsParams = {
    transaction: OnyxEntry<Transaction>;

    parentReportAction: OnyxEntry<ReportAction>;

    parentReport: OnyxEntry<Report>;

    policyForMovingExpenses?: OnyxEntry<Policy>;

    parentPolicy?: OnyxEntry<Policy>;

    transactionThreadReport?: OnyxEntry<Report>;

    policyCategories?: OnyxEntry<PolicyCategories>;

    policyTags?: OnyxEntry<PolicyTagLists>;

    transactionThreadNVP?: OnyxEntry<ReportNameValuePairs>;

    chatReportNVP?: OnyxEntry<ReportNameValuePairs>;

    /** Search query context. When provided, applies editable-tab guard for Search table. */
    queryJSON?: SearchQueryJSON;
};

/**
 * @private
 * Optimistically write a partial transaction update into the search snapshot so
 * the table row reflects the new value before the server responds.
 */
function optimisticallyUpdateSnapshotTransaction(hash: number, transactionID: string, partialTransaction: Partial<Transaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {
        data: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: partialTransaction as Transaction} as unknown as SearchResults['data'],
    });
}

/**
 * @private
 * Builds all params needed for IOU action calls from module-level Onyx caches.
 * The returned object can be spread directly into any updateMoneyRequest* call
 * (all shared fields are at the top level); field-specific extras like
 * policyTagList, policyRecentlyUsedCategories, and transaction are also included.
 */
function getIouParamsForTransaction(transactionID: string, transactionThreadReportID: string | undefined) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const reportID = transaction?.reportID;
    const parentReport = reportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] : undefined;
    const policyID = parentReport?.policyID;
    const policy = policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyTagList = policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] : undefined;
    const policyCategories = policyID ? allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] : undefined;
    const policyRecentlyUsedCategories = policyID ? allPolicyRecentlyUsedCategories?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`] : undefined;
    const parentReportNextStep = reportID ? allNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`] : undefined;
    const transactionThreadReport = transactionThreadReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] : undefined;

    return {
        // Shared base fields — spread directly into any updateMoneyRequest* call
        transactionID,
        transactionThreadReport,
        parentReport,
        policy,
        policyCategories,
        parentReportNextStep,
        currentUserAccountIDParam: currentUserAccountID,
        currentUserEmailParam: currentUserEmail,
        isASAPSubmitBetaEnabled: Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas),
        // Field-specific extras
        transaction,
        policyTagList,
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags: policyID ? allPolicyRecentlyUsedTags?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`] : undefined,
    };
}

/** Updates the date of an expense from the Search results table or the Expense Report page. */
function editTransactionDateInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newDate: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedCreated: newDate});
    }
    updateMoneyRequestDate({
        ...iouParams,
        // updateMoneyRequestDate uses 'policyTags' (not policyTagList)
        policyTags: iouParams.policyTagList,
        value: newDate,
        transactions: allTransactions,
        transactionViolations: allTransactionViolations,
        hash,
    });
}

/** Updates the merchant of an expense from the Search results table or the Expense Report page. */
function editTransactionMerchantInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newMerchant: string) {
    // Merchant must be a non-empty string. An empty merchant is not a valid
    // state and the IOU action would save it as a blank row label.
    if (!newMerchant.trim()) {
        return;
    }
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedMerchant: newMerchant});
    }
    updateMoneyRequestMerchant({
        ...iouParams,
        value: newMerchant,
        hash,
    });
}

/** Updates the description of an expense from the Search results table or the Expense Report page. */
function editTransactionDescriptionInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newDescription: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {comment: {comment: newDescription}});
    }
    updateMoneyRequestDescription({
        ...iouParams,
        comment: newDescription,
        hash,
    });
}

/** Updates the category of an expense from the Search results table or the Expense Report page. */
function editTransactionCategoryInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newCategory: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {category: newCategory});
    }
    updateMoneyRequestCategory({
        ...iouParams,
        category: newCategory,
        hash,
    });
}

/** Updates the amount and currency of an expense from the Search results table or the Expense Report page. */
function editTransactionAmountInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newAmount: number) {
    if (newAmount <= 0) {
        return;
    }
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    // Keep the existing currency — only the amount is changing from the search table
    const currency = iouParams.transaction?.modifiedCurrency ?? iouParams.transaction?.currency ?? CONST.CURRENCY.USD;
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedAmount: newAmount, modifiedCurrency: currency});
    }
    updateMoneyRequestAmountAndCurrency({
        ...iouParams,
        amount: newAmount,
        currency,
        // Preserve existing tax values from the live transaction record
        taxAmount: iouParams.transaction?.taxAmount ?? 0,
        taxCode: iouParams.transaction?.taxCode ?? '',
        taxValue: '',
        allowNegative: false,
        transactions: allTransactions,
        transactionViolations: allTransactionViolations,
        policyRecentlyUsedCurrencies: [],
        hash,
    });
}

/** Updates the tag of an expense from the Search results table or the Expense Report page. */
function editTransactionTagInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newTag: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    if (hash !== undefined) {
        optimisticallyUpdateSnapshotTransaction(hash, transactionID, {tag: newTag});
    }
    updateMoneyRequestTag({
        ...iouParams,
        tag: newTag,
        policyRecentlyUsedTags: iouParams.policyRecentlyUsedTags,
        hash,
    });
}

/**
 * Core inline-edit permission check, shared by the Search table and the Expense Report page.
 */
function getTransactionEditPermissions({
    transaction,
    parentReportAction,
    parentReport,
    policyForMovingExpenses,
    parentPolicy,
    transactionThreadReport,
    policyCategories,
    policyTags,
    transactionThreadNVP,
    chatReportNVP,
    queryJSON,
}: TransactionEditPermissionsParams): TransactionEditPermissions {
    // Apply Search-table tab guard when queryJSON is provided
    if (queryJSON !== undefined) {
        const isEditableTab = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE && CONST.SEARCH.INLINE_EDITABLE_EXPENSE_STATUSES.has((queryJSON.status as string) ?? '');
        if (!isEditableTab) {
            return NO_EDIT;
        }
    }

    if (!transaction) {
        return NO_EDIT;
    }

    if (isScanning(transaction)) {
        return NO_EDIT;
    }

    const isSplitTransaction = !!transaction.comment?.originalTransactionID || !!(transaction.comment?.splits && transaction.comment.splits.length > 0);
    if (isSplitTransaction) {
        return NO_EDIT;
    }

    const policyID = parentReport?.policyID;
    const policyTagLists = getTagLists(policyTags);
    const canEditCategoryForPolicy = () => !!policyID && policyID !== CONST.POLICY.ID_FAKE && !!parentPolicy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {});
    const canEditTagForPolicy = () => !isMultiLevelTags(policyTags) && (!!transaction?.tag || hasEnabledTags(policyTagLists));

    // Unreported track expenses (SelfDM) have no parent report or report action.
    // They are always editable by the creator. Category/tag logic matches MoneyRequestView:
    // - Category: editable if no policy OR policy has enabled categories
    // - Tag: editable if policy has enabled tags
    if (isExpenseUnreported(transaction)) {
        return {
            canEditDate: true,
            canEditMerchant: true,
            canEditDescription: true,
            canEditAmount: true,
            canEditCategory: !policyForMovingExpenses || hasEnabledOptions(policyCategories ?? {}),
            canEditTag: hasEnabledTags(policyTagLists),
        };
    }

    // All remaining expense types require a resolved parentReportAction.
    // However, when offline (or during sync), the parent action may not be in Onyx yet.
    // In that case, allow editing if the user owns the transaction and the report is not archived.
    if (!parentReportAction) {
        // If we have no parent report, we can't determine ownership or archive status
        if (!parentReport) {
            return NO_EDIT;
        }

        // Check if the parent report is archived
        const isChatReportArchived = isArchivedReport(chatReportNVP);
        if (isChatReportArchived) {
            return NO_EDIT;
        }

        // Check if the user owns this transaction (through the parent report)
        const isCurrentUserTransactionOwner = parentReport.ownerAccountID === currentUserAccountID;
        if (!isCurrentUserTransactionOwner) {
            return NO_EDIT;
        }

        // When settled or approved, only non-restricted fields (category, tag, description) can be edited.
        // Restricted fields (date, merchant, amount) cannot be edited once settled/approved.
        const isSettledOrApproved = isSettled(parentReport.reportID) || isReportIDApproved(parentReport.reportID);

        // Allow basic edits for owned transactions even without parentReportAction
        // This handles the offline case where the action hasn't synced yet
        return {
            canEditDate: !isSettledOrApproved,
            canEditMerchant: !isSettledOrApproved,
            canEditDescription: true,
            canEditAmount: !isSettledOrApproved,
            canEditCategory: canEditCategoryForPolicy(),
            canEditTag: canEditTagForPolicy(),
        };
    }

    const isTransactionThreadArchived = isArchivedReport(transactionThreadNVP);
    const isChatReportArchived = isArchivedReport(chatReportNVP);

    // Check if user can perform write actions on the transaction thread report
    const canUserEdit = canUserPerformWriteAction(transactionThreadReport, isTransactionThreadArchived);
    if (!canUserEdit) {
        return NO_EDIT;
    }

    if (!isMoneyRequestAction(parentReportAction)) {
        return NO_EDIT;
    }

    if (!canEditMoneyRequest(parentReportAction, isChatReportArchived, parentReport, parentPolicy, transaction)) {
        return NO_EDIT;
    }

    return {
        canEditDate: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditMerchant: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditDescription: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DESCRIPTION, false, false, undefined, transaction, parentReport, parentPolicy),
        // Only expenses tied to a real workspace with categories enabled.
        canEditCategory:
            canEditCategoryForPolicy() && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.CATEGORY, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditAmount: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, false, false, undefined, transaction, parentReport, parentPolicy),
        // Multi-level tags need a picker UI not available inline.
        // Allow editing if transaction already has a tag OR if there are enabled tags.
        canEditTag: canEditTagForPolicy() && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.TAG, false, false, undefined, transaction, parentReport, parentPolicy),
    };
}

export {
    editTransactionDateInline,
    editTransactionMerchantInline,
    editTransactionDescriptionInline,
    editTransactionCategoryInline,
    editTransactionAmountInline,
    editTransactionTagInline,
    getTransactionEditPermissions,
};

export type {TransactionEditPermissions};
