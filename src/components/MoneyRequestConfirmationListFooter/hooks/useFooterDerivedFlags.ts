import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getCurrency, isFetchingWaypointsFromServer, isManagedCardTransaction, isScanRequest, shouldShowAttendees as shouldShowAttendeesTransactionUtils} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UseFooterDerivedFlagsParams = {
    /** Action being performed (create / edit / submit / etc.) */
    action: IOUAction;

    /** Type of IOU being confirmed (excluding REQUEST and SEND) */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** The transaction being confirmed */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

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

    /** Whether the active transaction is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer-driven distance request */
    isOdometerDistanceRequest: boolean;

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
    transaction,
    policy,
    policyTagLists,
    isPolicyExpenseChat,
    isReadOnly,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
    isTypeInvoice,
    shouldShowSmartScanFields,
}: UseFooterDerivedFlagsParams) {
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();

    // Self-derived iou* values from transaction
    const iouCurrencyCode = getCurrency(transaction);
    const isScan = isScanRequest(transaction);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const shouldShowTags = (isPolicyExpenseChat || isUnreported || isCreatingTrackExpense) && hasEnabledTags(policyTagLists);
    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const shouldShowMap =
        isDistanceRequest && !isManualDistanceRequest && !isOdometerDistanceRequest && [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);

    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited.
    // For distance requests, don't show the merchant as there's already another "Distance" menu item.
    const shouldShowDate = shouldShowSmartScanFields || isDistanceRequest;

    // Determines whether the tax fields can be modified.
    // The tax fields can only be modified if the component is not in read-only mode
    // and it is not a distance request.
    const canModifyTaxFields = !isReadOnly && !isDistanceRequest && !isPerDiemRequest;

    // A flag for showing the billable field
    const shouldShowBillable = policy?.disabledFields?.defaultBillable === false;
    const shouldShowReimbursable =
        (isPolicyExpenseChat || isTrackExpense) && !!policy && policy?.disabledFields?.reimbursable !== true && !isManagedCardTransaction(transaction) && !isTypeInvoice;
    const shouldNavigateToUpgradePath = !policyForMovingExpensesID && !shouldSelectPolicy;
    const shouldShowTimeRequestFields = isTimeRequest && action === CONST.IOU.ACTION.CREATE;

    return {
        iouCurrencyCode,
        isScan,
        isTrackExpense,
        isUnreported,
        isCreatingTrackExpense,
        shouldShowTags,
        shouldShowAttendees,
        hasPendingWaypoints,
        hasErrors,
        shouldShowMap,
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
