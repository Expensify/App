/**
 * Centralizes inline-editing logic for a transaction row so that permission
 * derivation, Onyx subscriptions, and edit handlers live in one place rather
 * than being duplicated across every surface that renders a transaction.
 */
import {useCallback, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports -- Need original useOnyx to avoid reading partial Search snapshot policy data.
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
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
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';
import usePolicyForTransaction from './usePolicyForTransaction';
import useSelfDMReport from './useSelfDMReport';

type UseTransactionInlineEditParams = {
    transactionID: string;

    /**
     * Search snapshot hash.
     * When provided, edit functions will optimistically update the snapshot row.
     * Omit (or pass undefined) when editing from outside the Search table.
     */
    hash?: number;

    /**
     * Lightweight report action hint from the current surface.
     * Search rows already have this in snapshot data, which lets the hook avoid
     * scanning all report actions just to recover the thread/report action IDs.
     */
    linkedReportAction?: OnyxEntry<ReportAction>;
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

function useTransactionInlineEdit({transactionID, hash, linkedReportAction}: UseTransactionInlineEditParams): UseTransactionInlineEditReturn {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const reportID = transaction?.reportID;
    const isUnreported = isExpenseUnreported(transaction);
    const selfDMReport = useSelfDMReport();

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const effectiveParentReport = isUnreported ? selfDMReport : parentReport;
    const effectiveParentReportID = effectiveParentReport?.reportID;

    const linkedReportActionID = linkedReportAction?.reportActionID;

    const parentReportActionSelector = useCallback(
        (reportActions: ReportActions | undefined) =>
            linkedReportActionID ? reportActions?.[linkedReportActionID] : getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID),
        [linkedReportActionID, transactionID],
    );
    const [resolvedParentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(effectiveParentReportID)}`, {
        selector: parentReportActionSelector,
    });
    const parentReportAction = resolvedParentReportAction ?? linkedReportAction;

    const transactionThreadReportID = linkedReportAction?.childReportID ?? parentReportAction?.childReportID ?? transaction?.transactionThreadReportID;

    const chatReportID = effectiveParentReport?.chatReportID;

    // For unreported expenses (SelfDM), use active policy to show policy-specific fields like categories and tags.
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const reportPolicyID = effectiveParentReport?.policyID;
    const policyID = isUnreported ? activePolicyID : reportPolicyID;

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
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(effectiveParentReportID)}`);
    // Use original Onyx here because the useOnyx wrapper can read partial Search snapshot policy data instead of the full policy object.
    const [completePolicy] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);

    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(originalTransactionID)}`);

    const {hasSelectedTransactions} = useSearchStateContext();

    const isPerDiem = isPerDiemRequest(transaction);
    const {shouldSelectPolicy} = usePolicyForMovingExpenses(isPerDiem);

    const permissions = getTransactionEditPermissions({
        transaction,
        parentReportAction,
        parentReport: effectiveParentReport,
        policy: completePolicy ?? policy,
        transactionThreadReport,
        policyCategories,
        policyTags,
        transactionThreadNVP,
        chatReportNVP,
        originalTransaction,
        disabled: hasSelectedTransactions,
        shouldSelectPolicyForUnreported: shouldSelectPolicy,
    });

    const wasEditingOnMouseDownRef = useRef(false);

    const getEditParams = (): TransactionInlineEditParams => {
        return {
            hash,
            transactionID,
            parentReport: effectiveParentReport,
            parentReportAction,
            transactionThreadReport,
            policy: completePolicy ?? policy,
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
