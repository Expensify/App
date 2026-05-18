/**
 * Actions for inline editing of transactions from the Search results table and the Expense Report page.
 *
 * Each function delegates to the corresponding IOU action which owns the canonical Onyx record,
 * the API write, failure rollback, and snapshot updates (when a hash is provided).
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {convertToBackendAmount, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {isValidMerchant, isValidMoneyRequestAmount} from '@libs/MoneyRequestUtils';
import {getIsOffline} from '@libs/NetworkState';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {getTagLists, isMultiLevelTags} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction,
    findSelfDMReportID,
    isArchivedReport,
    isInvoiceReport,
    isIOUReport,
    isReportInGroupPolicy,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {calculateTaxAmount, getCurrency, getOriginalTransactionWithSplitInfo, getTaxValue, isDistanceRequest, isExpenseUnreported, isScanning} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    IntroSelected,
    Policy,
    PolicyCategories,
    PolicyTagLists,
    RecentlyUsedCategories,
    RecentlyUsedTags,
    Report,
    ReportAction,
    ReportActions,
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
import {createTransactionThreadReport} from './Report';

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

let allReports: NonNullable<OnyxCollection<Report>> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value ?? {};
    },
});

let allReportActions: NonNullable<OnyxCollection<ReportActions>> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportActions = value ?? {};
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

let introSelected: OnyxEntry<IntroSelected>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => {
        introSelected = value;
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

    /** When true, unreported expenses require workspace selection before category can be edited. */
    shouldSelectPolicyForUnreported?: boolean;
};

type GetIouParamsInput = {
    transactionID: string;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
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
    parentReportAction,
    transactionThreadReport,
    policy,
    policyCategories,
    policyTags,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    parentReportNextStep,
}: GetIouParamsInput) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const isUnreportedExpense = !transaction?.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    let resolvedParentReport = parentReport;
    if (!resolvedParentReport?.reportID && transaction?.reportID && transaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
        resolvedParentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
    }

    let resolvedParentReportAction = parentReportAction;
    if (!resolvedParentReportAction && resolvedParentReport?.reportID) {
        const reportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${resolvedParentReport.reportID}`] ?? {};
        resolvedParentReportAction = getIOUActionForTransactionID(Object.values(reportActions), transactionID);
    }

    if (isUnreportedExpense) {
        const selfDMReportID = findSelfDMReportID(allReports);
        if (selfDMReportID) {
            resolvedParentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`] ?? resolvedParentReport;

            if (!resolvedParentReportAction) {
                const selfDMReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`] ?? {};
                resolvedParentReportAction = getIOUActionForTransactionID(Object.values(selfDMReportActions), transactionID);
            }
        }
    }

    let resolvedTransactionThreadReport = transactionThreadReport;
    const transactionThreadReportID = resolvedTransactionThreadReport?.reportID ?? transaction?.transactionThreadReportID ?? resolvedParentReportAction?.childReportID;

    if (!resolvedTransactionThreadReport && transactionThreadReportID) {
        resolvedTransactionThreadReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`];
    }

    if (!resolvedTransactionThreadReport && resolvedParentReportAction && transaction) {
        resolvedTransactionThreadReport = createTransactionThreadReport({
            introSelected,
            currentUserLogin: currentUserEmail,
            currentUserAccountID,
            betas: allBetas,
            iouReport: resolvedParentReport,
            iouReportAction: resolvedParentReportAction,
            transaction,
            transactionViolations: transactionViolations ?? undefined,
        });
    }

    return {
        transactionID,
        transactionThreadReport: resolvedTransactionThreadReport,
        parentReport: resolvedParentReport,
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
        isOffline: getIsOffline(),
        hash: params.hash,
    });
}

/** Updates the merchant of an expense from the Search results table or the Expense Report page. */
function editTransactionMerchantInline(params: TransactionInlineEditParams, newMerchant: string) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    if (!isValidMerchant(newMerchant, transaction, params.parentReport)) {
        return;
    }

    const iouParams = getIouParamsForTransaction(params);
    updateMoneyRequestMerchant({
        ...iouParams,
        value: newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
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
    const iouParams = getIouParamsForTransaction(params);
    const iouType = isInvoiceReport(params.parentReport) ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT;
    const allowNegative = shouldEnableNegative(params.parentReport, iouParams.policy, iouType);
    const isP2P = isIOUReport(params.parentReport);

    if (!isValidMoneyRequestAmount(newAmount, iouType, allowNegative, isP2P)) {
        return;
    }

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
        allowNegative,
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
    shouldSelectPolicyForUnreported,
}: TransactionEditPermissionsParams): TransactionEditPermissions {
    if (disabled || !transaction) {
        return NO_EDIT;
    }

    const isUnreported = isExpenseUnreported(transaction);
    const isChatReportArchived = isArchivedReport(chatReportNVP);
    const isTransactionThreadArchived = isArchivedReport(transactionThreadNVP);
    const isTransactionScanning = isScanning(transaction);

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

    // For restricted fields, delegate to canEditFieldOfMoneyRequest.
    // Unreported expenses bypass this (all restricted fields editable by owner).
    const canEditRestricted = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
        if (field === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
            // Split expense children cannot have their amount edited inline
            const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

            if (isExpenseSplit) {
                return false;
            }

            // Amount field shows "Scanning..." during SmartScan
            if (isTransactionScanning) {
                return false;
            }
        }

        if (field === CONST.EDIT_REQUEST_FIELD.MERCHANT) {
            // Distance expenses cannot have their merchant edited
            if (isDistanceRequest(transaction)) {
                return false;
            }

            // Merchant field shows "Scanning..." during SmartScan
            if (isTransactionScanning) {
                return false;
            }
        }

        if (field === CONST.EDIT_REQUEST_FIELD.CATEGORY) {
            if (!policy?.areCategoriesEnabled && isCategoryMissing(transaction?.category)) {
                return false;
            }
            // Matches MoneyRequestView's shouldShowCategory logic
            // For policy expenses, check if there's a category or enabled options
            if (isReportInGroupPolicy(parentReport, policy)) {
                return !!(transaction?.category ?? '') || hasEnabledOptions(policyCategories ?? {});
            }
            // For unreported expenses, disable inline category editing while workspace selection is required.
            if (isUnreported) {
                return !shouldSelectPolicyForUnreported && hasEnabledOptions(policyCategories ?? {});
            }
        }

        if (field === CONST.EDIT_REQUEST_FIELD.TAG) {
            // Single-level tags only (multi-level needs a picker UI not available inline)
            if (isMultiLevelTags(policyTags)) {
                return false;
            }
            return !!transaction?.tag || hasEnabledTags(getTagLists(policyTags));
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
        canEditCategory: canEditRestricted(CONST.EDIT_REQUEST_FIELD.CATEGORY),
        canEditAmount: canEditRestricted(CONST.EDIT_REQUEST_FIELD.AMOUNT),
        canEditTag: canEditRestricted(CONST.EDIT_REQUEST_FIELD.TAG),
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

export type {TransactionEditPermissions, TransactionInlineEditParams, TransactionEditPermissionsParams};
