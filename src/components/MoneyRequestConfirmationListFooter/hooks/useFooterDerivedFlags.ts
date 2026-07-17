import {derivedFlagsSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';

import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import {shouldShowConfirmationDate} from '@libs/MoneyRequestUtils';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getCurrency, isManagedCardTransaction, isScanRequest, shouldShowAttendees as shouldShowAttendeesTransactionUtils} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type UseFooterDerivedFlagsParams = {
    /** Action being performed (create / edit / submit / etc.) */
    action: IOUAction;

    /** Type of IOU being confirmed (excluding REQUEST and SEND) */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction (the hook resolves a narrow slice internally) */
    transactionID: string | undefined;

    /** The policy that owns the confirmation context */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Tag lists for the active policy, indexed in policy declaration order */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** Whether the confirmation is happening inside a policy-expense chat */
    isPolicyExpenseChat: boolean;

    /** Whether the confirmation surface is read-only (no editing allowed) */
    isReadOnly: boolean;

    /** Whether the active transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether the active transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Whether the active transaction is a time-tracking request */
    isTimeRequest: boolean;

    /** Whether the IOU type is invoice */
    isTypeInvoice: boolean;

    /** Whether smart-scan-driven fields (amount, merchant, date) should be shown */
    shouldShowSmartScanFields: boolean;
};

function useFooterDerivedFlags({
    action,
    iouType,
    transactionID,
    policy,
    policyTagLists,
    isPolicyExpenseChat,
    isReadOnly,
    isDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
    isTypeInvoice,
    shouldShowSmartScanFields,
}: UseFooterDerivedFlagsParams) {
    const {policyForMovingExpenses, shouldSelectPolicy, shouldNavigateToUpgradePath: canNavigateToUpgradePath} = usePolicyForMovingExpenses();

    const transaction = useTransactionSelector(transactionID, derivedFlagsSliceSelector);

    // Self-derived iou* values from the slice
    const iouCurrencyCode = getCurrency(transaction);
    const isScan = isScanRequest(transaction);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const shouldShowTags = (isPolicyExpenseChat || isUnreported || isCreatingTrackExpense) && hasEnabledTags(policyTagLists);
    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited.
    // For distance requests, don't show the merchant as there's already another "Distance" menu item.
    const shouldShowDate = shouldShowConfirmationDate(shouldShowSmartScanFields, isDistanceRequest);

    // Determines whether the tax fields can be modified.
    // The tax fields can only be modified if the component is not in read-only mode
    // and it is not a distance request.
    const canModifyTaxFields = !isReadOnly && !isDistanceRequest && !isPerDiemRequest;

    // A flag for showing the billable field
    const shouldShowBillable = isBillableEnabledOnPolicy(policy);
    const shouldShowReimbursable =
        (isPolicyExpenseChat || isTrackExpense) && !!policy && policy?.disabledFields?.reimbursable !== true && !isManagedCardTransaction(transaction) && !isTypeInvoice;
    // Submit workspaces ship Categories/Distance enabled by default, so never route their fields to the upgrade gate.
    const isSubmitWorkspace = isSubmitPolicy(policy);
    const shouldNavigateToUpgradePath = !isSubmitWorkspace && canNavigateToUpgradePath;
    const shouldShowTimeRequestFields = isTimeRequest && action === CONST.IOU.ACTION.CREATE;

    return {
        iouCurrencyCode,
        isScan,
        isTrackExpense,
        isUnreported,
        isCreatingTrackExpense,
        shouldShowTags,
        shouldShowAttendees,
        shouldShowDate,
        canModifyTaxFields,
        shouldShowBillable,
        shouldShowReimbursable,
        shouldNavigateToUpgradePath,
        shouldShowTimeRequestFields,
        policyForMovingExpenses,
        shouldSelectPolicy,
    };
}

export default useFooterDerivedFlags;
