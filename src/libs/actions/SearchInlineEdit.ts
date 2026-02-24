/**
 * Actions for editing transactions directly from the Search results table.
 *
 * Each function optimistically updates the snapshot entry (so the row
 * reflects the new value immediately) then delegates to the corresponding
 * IOU action which owns the canonical Onyx record, the API write, and
 * failure rollback.
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import Permissions from '@libs/Permissions';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    OnyxInputOrEntry,
    Policy,
    PolicyCategories,
    PolicyTagLists,
    RecentlyUsedCategories,
    Report,
    ReportAction,
    ReportNextStepDeprecated,
    SearchResults,
    Transaction,
    TransactionViolations,
} from '@src/types/onyx';
import {updateMoneyRequestAmountAndCurrency, updateMoneyRequestCategory, updateMoneyRequestDate, updateMoneyRequestDescription, updateMoneyRequestMerchant} from './IOU';

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
    };
}

/** Updates the date of an expense from the Search results table. */
function editTransactionDateOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newDate: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedCreated: newDate});
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

/** Updates the merchant of an expense from the Search results table. */
function editTransactionMerchantOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newMerchant: string) {
    // Merchant must be a non-empty string. An empty merchant is not a valid
    // state and the IOU action would save it as a blank row label.
    if (!newMerchant.trim()) {
        return;
    }
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedMerchant: newMerchant});
    updateMoneyRequestMerchant({
        ...iouParams,
        value: newMerchant,
        hash,
    });
}

/** Updates the description of an expense from the Search results table. */
function editTransactionDescriptionOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newDescription: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {comment: {comment: newDescription}});
    updateMoneyRequestDescription({
        ...iouParams,
        comment: newDescription,
        hash,
    });
}

/** Updates the category of an expense from the Search results table. */
function editTransactionCategoryOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newCategory: string) {
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {category: newCategory});
    updateMoneyRequestCategory({
        ...iouParams,
        category: newCategory,
        hash,
    });
}

/** Updates the amount and currency of an expense from the Search results table. */
function editTransactionAmountOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newAmount: number) {
    if (newAmount <= 0) {
        return;
    }
    const iouParams = getIouParamsForTransaction(transactionID, transactionThreadReportID);
    // Keep the existing currency — only the amount is changing from the search table
    const currency = iouParams.transaction?.modifiedCurrency ?? iouParams.transaction?.currency ?? CONST.CURRENCY.USD;
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedAmount: newAmount, modifiedCurrency: currency});
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

/** Returns per-field edit permissions for a transaction in the Search table. */
function getSearchTransactionEditPermissions(
    transactionID: string,
    parentReportAction: OnyxInputOrEntry<ReportAction> | undefined,
    queryJSON: SearchQueryJSON | undefined,
): {canEditDate: boolean; canEditMerchant: boolean; canEditDescription: boolean; canEditCategory: boolean; canEditAmount: boolean} {
    const noEdit = {canEditDate: false, canEditMerchant: false, canEditDescription: false, canEditCategory: false, canEditAmount: false};

    const isEditableTab = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && CONST.SEARCH.INLINE_EDITABLE_EXPENSE_STATUSES.has((queryJSON?.status as string) ?? '');
    if (!isEditableTab) {
        return noEdit;
    }

    // parentReportAction may be undefined while the Onyx subscription is loading;
    // return noEdit until it arrives so permissions aren't prematurely granted.
    if (!parentReportAction) {
        return noEdit;
    }

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const reportID = transaction?.reportID;
    const parentReport = reportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] : undefined;
    const policyID = parentReport?.policyID;
    const parentPolicy = policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;

    // Changing a split-parent amount would leave child splits inconsistent.
    const isSplitTransaction = !!transaction?.comment?.originalTransactionID || !!(transaction?.comment?.splits && transaction.comment.splits.length > 0);

    return {
        canEditDate: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditMerchant: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditDescription: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DESCRIPTION, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditCategory: canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.CATEGORY, false, false, undefined, transaction, parentReport, parentPolicy),
        canEditAmount:
            !isSplitTransaction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, false, false, undefined, transaction, parentReport, parentPolicy),
    };
}

export {
    editTransactionDateOnSearch,
    editTransactionMerchantOnSearch,
    editTransactionDescriptionOnSearch,
    editTransactionCategoryOnSearch,
    editTransactionAmountOnSearch,
    getSearchTransactionEditPermissions,
};
