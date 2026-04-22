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
} from './IOU/UpdateMoneyRequest';

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

    originalTransaction?: OnyxEntry<Transaction>;

    /** When true, all editing is disabled regardless of permissions. */
    disabled?: boolean;
};

type GetIouParamsInput = {
    transactionID: string;
    parentReport: OnyxEntry<Report>;
    transactionThreadReport: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    policyTags: OnyxEntry<PolicyTagLists>;
    policyRecentlyUsedCategories: OnyxEntry<RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    parentReportNextStep: OnyxEntry<ReportNextStepDeprecated>;
};

type TransactionInlineEditParams = GetIouParamsInput & {
    hash: number | undefined;
};

/**
 * @private
 * Builds all params needed for IOU action calls.
 * The returned object can be spread directly into any updateMoneyRequest* call
 * (all shared fields are at the top level); field-specific extras like
 * policyTagList, policyRecentlyUsedCategories, and transaction are also included.
 */
function getIouParamsForTransaction({
    transactionID,
    parentReport,
    transactionThreadReport,
    policy,
    policyCategories,
    policyTags,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    parentReportNextStep,
}: GetIouParamsInput) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

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
        policyTagList: policyTags,
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
    };
}

/** Updates the date of an expense from the Search results table or the Expense Report page. */
function editTransactionDateInline(params: TransactionInlineEditParams, newDate: string) {
    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestDate({
        ...iouParams,
        // updateMoneyRequestDate uses 'policyTags' (not policyTagList)
        policyTags: iouParams.policyTagList,
        value: newDate,
        transactions: allTransactions,
        transactionViolations: allTransactionViolations,
        hash: params.hash,
    });
}

/** Updates the merchant of an expense from the Search results table or the Expense Report page. */
function editTransactionMerchantInline(params: TransactionInlineEditParams, newMerchant: string) {
    // Merchant must be a non-empty string. An empty merchant is not a valid
    // state and the IOU action would save it as a blank row label.
    if (!newMerchant.trim()) {
        return;
    }
    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestMerchant({
        ...iouParams,
        value: newMerchant,
        hash: params.hash,
    });
}

/** Updates the description of an expense from the Search results table or the Expense Report page. */
function editTransactionDescriptionInline(params: TransactionInlineEditParams, newDescription: string) {
    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestDescription({
        ...iouParams,
        comment: newDescription,
        hash: params.hash,
    });
}

/** Updates the category of an expense from the Search results table or the Expense Report page. */
function editTransactionCategoryInline(params: TransactionInlineEditParams, newCategory: string) {
    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestCategory({
        ...iouParams,
        category: newCategory,
        hash: params.hash,
    });
}

/** Updates the amount and currency of an expense from the Search results table or the Expense Report page. */
function editTransactionAmountInline(params: TransactionInlineEditParams, newAmount: number) {
    if (newAmount < 0) {
        return;
    }
    const iouParams = getIouParamsForTransaction(params);
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
        hash: params.hash,
    });
}

/** Updates the tag of an expense from the Search results table or the Expense Report page. */
function editTransactionTagInline(params: TransactionInlineEditParams, newTag: string) {
    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestTag({
        ...iouParams,
        tag: newTag,
        policyRecentlyUsedTags: iouParams.policyRecentlyUsedTags,
        hash: params.hash,
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
    originalTransaction,
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

export type {TransactionInlineEditParams, TransactionEditPermissions};
