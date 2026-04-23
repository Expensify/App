/**
 * Centralizes inline-editing logic for a transaction row so that permission
 * derivation, Onyx subscriptions, and edit handlers live in one place rather
 * than being duplicated across every surface that renders a transaction.
 */
import {useCallback, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TransactionInlineEditParams} from '@libs/actions/TransactionInlineEdit';
import {
    editTransactionAmountInline,
    editTransactionCategoryInline,
    editTransactionDateInline,
    editTransactionDescriptionInline,
    editTransactionMerchantInline,
    editTransactionTagInline,
    getTransactionEditPermissions,
} from '@libs/actions/TransactionInlineEdit';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isExpenseUnreported, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForTransaction from './usePolicyForTransaction';

type UseTransactionInlineEditParams = {
    transactionID: string;
    reportID: string | undefined;

    /**
     * When provided the action is looked up directly by ID (faster).
     * If omitted, the hook scans all actions for the one matching this transaction.
     * Ignored when `parentReportAction` is supplied directly.
     */
    reportActionID?: string;

    /**
     * Pre-fetched parent report action.
     * When provided the hook skips its own Onyx subscription entirely, avoiding
     * a duplicate subscription in components that already hold this data.
     */
    parentReportAction?: OnyxEntry<ReportAction>;

    /**
     * Search snapshot hash.
     * When provided, edit functions will optimistically update the snapshot row.
     * Omit (or pass undefined) when editing from outside the Search table.
     */
    hash?: number;

    /**
     * Search query context.
     * When provided the editable-tab guard is applied — only tab types/statuses
     * that support inline editing will return canEdit=true.
     * Omit when editing from the Expense Report page (always editable by permissions alone).
     */
    queryJSON?: SearchQueryJSON;

    /**
     * Fallback report from the search snapshot.
     * Used when the Onyx report cache is empty (e.g. after cache clear) so that
     * permission checks like isSettled still have a report object with statusNum.
     */
    fallbackReport?: OnyxEntry<Report>;
};

type UseTransactionInlineEditReturn = {
    canEditDate: boolean;
    canEditMerchant: boolean;
    canEditDescription: boolean;
    canEditCategory: boolean;
    canEditAmount: boolean;
    canEditTag: boolean;
    transactionThreadReportID: string | undefined;
    onEditDate: (newDate: string) => void;
    onEditMerchant: (newMerchant: string) => void;
    onEditDescription: (newDescription: string) => void;
    onEditCategory: (newCategory: string) => void;
    onEditAmount: (newAmount: number) => void;
    onEditTag: (newTag: string) => void;
    /**
     * Ref that should be written in onPressIn and checked in onPress to suppress
     * row navigation when a cell edit is being dismissed.
     */
    wasEditingOnMouseDownRef: React.RefObject<boolean>;
};

function useTransactionInlineEdit({
    transactionID,
    reportID,
    reportActionID,
    parentReportAction: externalParentReportAction,
    hash,
    fallbackReport,
}: UseTransactionInlineEditParams): UseTransactionInlineEditReturn {
    // Look up the parent IOU report action from live Onyx. If the caller already
    // knows the action ID we can select it directly; otherwise we scan all actions.
    // When the caller supplies `parentReportAction` directly we still must call
    // useOnyx (rules of hooks) but we ignore its result and prefer the external value.
    const parentReportActionSelector = useCallback(
        (reportActions: ReportActions | undefined) => (reportActionID ? reportActions?.[reportActionID] : getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID)),
        [reportActionID, transactionID],
    );

    const [internalParentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {
        selector: parentReportActionSelector,
    });

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    const parentReportAction = externalParentReportAction !== undefined ? externalParentReportAction : internalParentReportAction;

    const transactionThreadReportID = parentReportAction?.childReportID;
    const chatReportID = parentReport?.chatReportID;

    // For unreported expenses (SelfDM), use active policy to show policy-specific fields like categories and tags.
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const reportPolicyID = parentReport?.policyID;
    const policyID = isExpenseUnreported(transaction) ? activePolicyID : reportPolicyID;

    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID,
        action: CONST.IOU.ACTION.EDIT,
        iouType: CONST.IOU.TYPE.SUBMIT,
        isPerDiemRequest: isPerDiemRequest(transaction),
    });

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [transactionThreadNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [chatReportNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(chatReportID)}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(reportID)}`);

    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(originalTransactionID)}`);

    const {hasSelectedTransactions} = useSearchStateContext();

    const permissions = getTransactionEditPermissions({
        transaction,
        parentReportAction,
        parentReport: parentReport ?? fallbackReport,
        policy,
        transactionThreadReport,
        policyCategories,
        policyTags,
        transactionThreadNVP,
        chatReportNVP,
        originalTransaction,
        disabled: hasSelectedTransactions,
    });

    const wasEditingOnMouseDownRef = useRef(false);

    const getEditParams = (): TransactionInlineEditParams => {
        return {
            hash,
            transactionID,
            parentReport: parentReport ?? fallbackReport,
            transactionThreadReport,
            policy,
            policyCategories,
            policyTags,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            parentReportNextStep,
        };
    };

    const onEditDate = (newDate: string) => {
        editTransactionDateInline(getEditParams(), newDate);
    };

    const onEditMerchant = (newMerchant: string) => {
        editTransactionMerchantInline(getEditParams(), newMerchant);
    };

    const onEditDescription = (newDescription: string) => {
        editTransactionDescriptionInline(getEditParams(), newDescription);
    };

    const onEditCategory = (newCategory: string) => {
        editTransactionCategoryInline(getEditParams(), newCategory);
    };

    const onEditAmount = (newAmount: number) => {
        editTransactionAmountInline(getEditParams(), newAmount);
    };

    const onEditTag = (newTag: string) => {
        editTransactionTagInline(getEditParams(), newTag);
    };

    return {
        ...permissions,
        transactionThreadReportID,
        onEditDate,
        onEditMerchant,
        onEditDescription,
        onEditCategory,
        onEditAmount,
        onEditTag,
        wasEditingOnMouseDownRef,
    };
}

export default useTransactionInlineEdit;
