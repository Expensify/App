/**
 * Actions for editing transactions directly from the Search results table.
 *
 * Design:
 * - All Onyx data (reports, policies, tags, categories, session, betas) is
 *   subscribed at module level so callers only need to pass the minimal
 *   inputs: hash, transactionID, the transactionThread reportID, and the new
 *   value.
 * - Each function optimistically updates the snapshot entry (so the row
 *   reflects the new value immediately) then delegates to the corresponding
 *   IOU action which owns the canonical Onyx record, the API write, and
 *   failure rollback.
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
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
    Transaction,
    TransactionViolations,
} from '@src/types/onyx';
import Permissions from '@libs/Permissions';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import {updateMoneyRequestAmountAndCurrency, updateMoneyRequestCategory, updateMoneyRequestDate, updateMoneyRequestDescription, updateMoneyRequestMerchant} from './IOU';

// ---------------------------------------------------------------------------
// Module-level Onyx subscriptions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Optimistically write a partial transaction update into the search snapshot so
 * the table row reflects the new value before the server responds.
 */
function optimisticallyUpdateSnapshotTransaction(hash: number, transactionID: string, partialTransaction: Partial<Transaction>) {
    Onyx.merge(
        `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        {data: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: partialTransaction}} as any,
    );
}

/**
 * Build the common IOU action params that can be derived from module-level
 * Onyx caches, given only transactionID + optional transactionThreadReportID.
 */
function getParamsForTransaction(transactionID: string, transactionThreadReportID: string | undefined) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const reportID = transaction?.reportID ?? '';
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const policyID = parentReport?.policyID ?? '';
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const policyRecentlyUsedCategories = allPolicyRecentlyUsedCategories?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`];
    const parentReportNextStep = allNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`];
    const transactionThreadReport = transactionThreadReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] : undefined;

    return {
        transaction,
        transactionID,
        parentReport,
        transactionThreadReport,
        policy,
        policyTagList,
        policyCategories,
        policyRecentlyUsedCategories,
        parentReportNextStep,
        currentUserAccountIDParam: currentUserAccountID,
        currentUserEmailParam: currentUserEmail,
        isASAPSubmitBetaEnabled: Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas),
    };
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

/** Updates the date of an expense from the Search results table. */
function editTransactionDateOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newDate: string) {
    const p = getParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedCreated: newDate});
    updateMoneyRequestDate({
        transactionID: p.transactionID,
        transactionThreadReport: p.transactionThreadReport,
        parentReport: p.parentReport,
        policy: p.policy,
        // updateMoneyRequestDate uses 'policyTags' (not policyTagList)
        policyTags: p.policyTagList,
        policyCategories: p.policyCategories,
        currentUserAccountIDParam: p.currentUserAccountIDParam,
        currentUserEmailParam: p.currentUserEmailParam,
        isASAPSubmitBetaEnabled: p.isASAPSubmitBetaEnabled,
        parentReportNextStep: p.parentReportNextStep,
        value: newDate,
        transactions: allTransactions,
        transactionViolations: allTransactionViolations,
    });
}

/** Updates the merchant of an expense from the Search results table. */
function editTransactionMerchantOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newMerchant: string) {
    // Merchant must be a non-empty string. An empty merchant is not a valid
    // state and the IOU action would save it as a blank row label.
    if (!newMerchant.trim()) {
        return;
    }
    const p = getParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedMerchant: newMerchant});
    updateMoneyRequestMerchant({
        transactionID: p.transactionID,
        transactionThreadReport: p.transactionThreadReport,
        parentReport: p.parentReport,
        policy: p.policy,
        policyTagList: p.policyTagList,
        policyCategories: p.policyCategories,
        currentUserAccountIDParam: p.currentUserAccountIDParam,
        currentUserEmailParam: p.currentUserEmailParam,
        isASAPSubmitBetaEnabled: p.isASAPSubmitBetaEnabled,
        parentReportNextStep: p.parentReportNextStep,
        value: newMerchant,
    });
}

/** Updates the description of an expense from the Search results table. */
function editTransactionDescriptionOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newDescription: string) {
    const p = getParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {comment: {comment: newDescription}});
    updateMoneyRequestDescription({
        transactionID: p.transactionID,
        transactionThreadReport: p.transactionThreadReport,
        parentReport: p.parentReport,
        policy: p.policy,
        policyTagList: p.policyTagList,
        policyCategories: p.policyCategories,
        currentUserAccountIDParam: p.currentUserAccountIDParam,
        currentUserEmailParam: p.currentUserEmailParam,
        isASAPSubmitBetaEnabled: p.isASAPSubmitBetaEnabled,
        parentReportNextStep: p.parentReportNextStep,
        comment: newDescription,
    });
}

/** Updates the category of an expense from the Search results table. */
function editTransactionCategoryOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newCategory: string) {
    const p = getParamsForTransaction(transactionID, transactionThreadReportID);
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {category: newCategory});
    updateMoneyRequestCategory({
        transactionID: p.transactionID,
        transactionThreadReport: p.transactionThreadReport,
        parentReport: p.parentReport,
        policy: p.policy,
        policyTagList: p.policyTagList,
        policyCategories: p.policyCategories,
        policyRecentlyUsedCategories: p.policyRecentlyUsedCategories,
        currentUserAccountIDParam: p.currentUserAccountIDParam,
        currentUserEmailParam: p.currentUserEmailParam,
        isASAPSubmitBetaEnabled: p.isASAPSubmitBetaEnabled,
        parentReportNextStep: p.parentReportNextStep,
        category: newCategory,
        hash,
    });
}

/** Updates the amount and currency of an expense from the Search results table. */
function editTransactionAmountOnSearch(hash: number, transactionID: string, transactionThreadReportID: string | undefined, newAmount: number) {
    if (newAmount <= 0) {
        return;
    }
    const p = getParamsForTransaction(transactionID, transactionThreadReportID);
    // Keep the existing currency — only the amount is changing from the search table
    const currency = p.transaction?.modifiedCurrency ?? p.transaction?.currency ?? CONST.CURRENCY.USD;
    optimisticallyUpdateSnapshotTransaction(hash, transactionID, {modifiedAmount: newAmount, modifiedCurrency: currency});
    updateMoneyRequestAmountAndCurrency({
        transactionID: p.transactionID,
        transactionThreadReport: p.transactionThreadReport,
        parentReport: p.parentReport,
        policy: p.policy,
        policyTagList: p.policyTagList,
        policyCategories: p.policyCategories,
        currentUserAccountIDParam: p.currentUserAccountIDParam,
        currentUserEmailParam: p.currentUserEmailParam,
        isASAPSubmitBetaEnabled: p.isASAPSubmitBetaEnabled,
        parentReportNextStep: p.parentReportNextStep,
        amount: newAmount,
        currency,
        // Preserve existing tax values from the live transaction record
        taxAmount: p.transaction?.taxAmount ?? 0,
        taxCode: p.transaction?.taxCode ?? '',
        taxValue: '',
        allowNegative: false,
        transactions: allTransactions,
        transactionViolations: allTransactionViolations,
        policyRecentlyUsedCurrencies: [],
    });
}

// Only editable on expense-type tabs that are not in a terminal state.
// APPROVED / DONE / PAID are omitted; canEditFieldOfMoneyRequest also blocks them.
const EDITABLE_STATUSES = new Set<string>([
    CONST.SEARCH.STATUS.EXPENSE.ALL,
    CONST.SEARCH.STATUS.EXPENSE.UNREPORTED,
    CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
    CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
]);

/** Returns per-field edit permissions for a transaction in the Search table. */
function getSearchTransactionEditPermissions(
    transactionID: string,
    parentReportAction: OnyxInputOrEntry<ReportAction> | undefined,
    queryJSON: SearchQueryJSON | undefined,
): {canEditDate: boolean; canEditMerchant: boolean; canEditDescription: boolean; canEditCategory: boolean; canEditAmount: boolean} {
    const noEdit = {canEditDate: false, canEditMerchant: false, canEditDescription: false, canEditCategory: false, canEditAmount: false};

    const isEditableTab = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && EDITABLE_STATUSES.has((queryJSON?.status as string) ?? '');
    if (!isEditableTab) {
        return noEdit;
    }

    // parentReportAction may be undefined while the Onyx subscription is loading;
    // return noEdit until it arrives so permissions aren't prematurely granted.
    if (!parentReportAction) {
        return noEdit;
    }

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const reportID = transaction?.reportID ?? '';
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? undefined;
    const policyID = parentReport?.policyID ?? '';
    const parentPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? undefined;

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
