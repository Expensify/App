/**
 * Actions for inline editing of transactions from the Search results table and the Expense Report page.
 *
 * Each function delegates to the corresponding IOU action which owns the canonical Onyx record,
 * the API write, failure rollback, and snapshot updates (when a hash is provided).
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {convertToBackendAmount, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {getTagLists, isMultiLevelTags} from '@libs/PolicyUtils';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, canEditMoneyRequest, canUserPerformWriteAction, isArchivedReport, isReportInGroupPolicy} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {calculateTaxAmount, getCurrency, getOriginalTransactionWithSplitInfo, getTaxValue, isExpenseUnreported} from '@libs/TransactionUtils';
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

    policy?: OnyxEntry<Policy>;

    transactionThreadReport?: OnyxEntry<Report>;

    policyCategories?: OnyxEntry<PolicyCategories>;

    policyTags?: OnyxEntry<PolicyTagLists>;

    transactionThreadNVP?: OnyxEntry<ReportNameValuePairs>;

    chatReportNVP?: OnyxEntry<ReportNameValuePairs>;

    /** When true, all editing is disabled regardless of permissions. */
    disabled?: boolean;
};

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
    updateMoneyRequestMerchant({
        ...iouParams,
        value: newMerchant,
        hash,
    });
}

/** Updates the description of an expense from the Search results table or the Expense Report page. */
function editTransactionDescriptionInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newDescription: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    updateMoneyRequestDescription({
        ...iouParams,
        comment: newDescription,
        hash,
    });
}

/** Updates the category of an expense from the Search results table or the Expense Report page. */
function editTransactionCategoryInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newCategory: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    updateMoneyRequestCategory({
        ...iouParams,
        category: newCategory,
        hash,
    });
}

/** Updates the amount and currency of an expense from the Search results table or the Expense Report page. */
function editTransactionAmountInline(hash: number | undefined, transactionID: string, transactionThreadReportID: string | undefined, newAmount: number) {
    if (newAmount < 0) {
        return;
    }
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    // Keep the existing currency — only the amount is changing from the search table
    const currency = iouParams.transaction?.modifiedCurrency ?? iouParams.transaction?.currency ?? CONST.CURRENCY.USD;
    // Recalculate tax from the existing tax code and the new amount
    const taxCode = iouParams.transaction?.taxCode ?? '';
    const taxPercentage = getTaxValue(iouParams.policy, iouParams.transaction, taxCode) ?? '';
    const decimals = getCurrencyDecimals(getCurrency(iouParams.transaction));
    const taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, newAmount, decimals));
    updateMoneyRequestAmountAndCurrency({
        ...iouParams,
        amount: newAmount,
        currency,
        taxAmount,
        taxCode,
        taxValue: taxPercentage,
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
    updateMoneyRequestTag({
        ...iouParams,
        tag: newTag,
        policyRecentlyUsedTags: iouParams.policyRecentlyUsedTags,
        hash,
    });
}

/**
 * Core inline-edit permission check, shared by the Search table and the Expense Report page.
 * Mirrors MoneyRequestView's permission logic:
 * 1. isEditable = canUserPerformWriteAction(transactionThreadReport)
 * 2. canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(...) && isEditable
 * 3. Restricted fields (date, merchant, amount): canEditFieldOfMoneyRequest per field
 * 4. Non-restricted fields (description, category, tag): canEdit + policy feature flags
 */
function getTransactionEditPermissions({
    transaction,
    parentReportAction,
    parentReport,
    policy,
    transactionThreadReport,
    policyCategories,
    policyTags,
    transactionThreadNVP,
    chatReportNVP,
    disabled,
}: TransactionEditPermissionsParams): TransactionEditPermissions {
    if (disabled) {
        return NO_EDIT;
    }

    if (!transaction) {
        return NO_EDIT;
    }

    const isUnreported = isExpenseUnreported(transaction);
    const isChatReportArchived = isArchivedReport(chatReportNVP);
    const isTransactionThreadArchived = isArchivedReport(transactionThreadNVP);

    // Matches MoneyRequestView's isEditable.
    // For unreported expenses the user always owns these. When the transaction
    // thread report hasn't been loaded into Onyx yet (common in Search), we
    // can't evaluate canUserPerformWriteAction — skip the check and let
    // canEditMoneyRequest be the gatekeeper instead of blocking all editing.
    const isEditable = isUnreported || !transactionThreadReport || !!canUserPerformWriteAction(transactionThreadReport, isTransactionThreadArchived);
    if (!isEditable) {
        return NO_EDIT;
    }

    // Matches MoneyRequestView's canEdit.
    // For unreported expenses, parentReportAction may not be loaded; they are
    // always editable by the owner.
    const canEdit = isUnreported || (isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, transaction, isChatReportArchived, parentReport, policy));
    if (!canEdit) {
        return NO_EDIT;
    }

    const policyTagLists = getTagLists(policyTags);
    const isPolicyExpenseChat = isReportInGroupPolicy(parentReport, policy);
    const categoryForDisplay = transaction?.category ?? '';

    // For restricted fields, delegate to canEditFieldOfMoneyRequest.
    // Unreported expenses bypass this (all restricted fields editable by owner).
    const canEditRestricted = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
        if (field === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
            // Split expense children cannot have their amount edited inline
            const originalTransactionID = transaction?.comment?.originalTransactionID;
            const originalTransaction = originalTransactionID ? allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`] : undefined;
            const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

            if (isExpenseSplit) {
                return false;
            }
        }

        return (
            isUnreported ||
            canEditFieldOfMoneyRequest({
                reportAction: parentReportAction,
                fieldToEdit: field,
                isChatReportArchived,
                transaction,
                report: parentReport,
                policy,
            })
        );
    };

    return {
        canEditDate: canEditRestricted(CONST.EDIT_REQUEST_FIELD.DATE),
        canEditMerchant: canEditRestricted(CONST.EDIT_REQUEST_FIELD.MERCHANT),
        // Non-restricted; always editable when canEdit is true
        canEditDescription: true,
        // Matches MoneyRequestView's shouldShowCategory logic
        canEditCategory:
            (isPolicyExpenseChat && (!!categoryForDisplay || hasEnabledOptions(policyCategories ?? {}))) || (isUnreported && (!policy || hasEnabledOptions(policyCategories ?? {}))),
        canEditAmount: canEditRestricted(CONST.EDIT_REQUEST_FIELD.AMOUNT),
        // single-level tags only (multi-level needs a picker UI not available inline).
        canEditTag: !isMultiLevelTags(policyTags) && (!!transaction?.tag || hasEnabledTags(policyTagLists)),
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
