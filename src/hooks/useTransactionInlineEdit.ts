/**
 * Centralizes inline-editing logic for a transaction row so that permission
 * derivation, Onyx subscriptions, and edit handlers live in one place rather
 * than being duplicated across every surface that renders a transaction.
 */
import {useCallback, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
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
import {isExpenseUnreported} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

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
    queryJSON,
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
    const policyID = parentReport?.policyID;
    const chatReportID = parentReport?.chatReportID;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [transactionThreadNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [chatReportNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(chatReportID)}`);

    // For unreported expenses (SelfDM), get the user's default policy for moving expenses.
    // This policy determines whether category/tag editing is allowed.
    const isUnreported = isExpenseUnreported(transaction);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses(undefined, undefined);
    const policyForPermissions = isUnreported ? policyForMovingExpenses : undefined;

    const permissions = getTransactionEditPermissions({
        transaction,
        parentReportAction,
        parentReport,
        policyForMovingExpenses: policyForPermissions,
        parentPolicy: policy,
        transactionThreadReport,
        policyCategories,
        policyTags,
        transactionThreadNVP,
        chatReportNVP,
        queryJSON,
    });

    const wasEditingOnMouseDownRef = useRef(false);

    const onEditDate = (newDate: string) => {
        editTransactionDateInline(hash, transactionID, transactionThreadReportID, newDate);
    };

    const onEditMerchant = (newMerchant: string) => {
        editTransactionMerchantInline(hash, transactionID, transactionThreadReportID, newMerchant);
    };

    const onEditDescription = (newDescription: string) => {
        editTransactionDescriptionInline(hash, transactionID, transactionThreadReportID, newDescription);
    };

    const onEditCategory = (newCategory: string) => {
        editTransactionCategoryInline(hash, transactionID, transactionThreadReportID, newCategory);
    };

    const onEditAmount = (newAmount: number) => {
        editTransactionAmountInline(hash, transactionID, transactionThreadReportID, newAmount);
    };

    const onEditTag = (newTag: string) => {
        editTransactionTagInline(hash, transactionID, transactionThreadReportID, newTag);
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
