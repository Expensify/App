import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import DistanceManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceManualFooter';
import DistanceMapFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceMapFooter';
import DistanceOdometerFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceOdometerFooter';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {
    getCreated,
    getCurrency,
    hasValidModifiedAmount,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a distance expense, for all three of its shapes: a mapped route, a manually entered distance, and an
 * odometer reading.
 *
 * The three share one list because they mount exactly the same things — `DistanceRequestController` gates every
 * effect on `isDistanceRequest`, which is true for all of them, and the commuter-exclusion fields are written for
 * all three. What differs is only the footer: the mapped route shows a map, and the odometer flow is the one that
 * can surface a receipt stitch error.
 *
 * A distance expense is never a scan and never enters the compact layout.
 */
function DistanceConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {
        transaction,
        selectedParticipants,
        isEditingSplitBill,
        isOdometerDistanceRequest = false,
        receiptStitchError,
        isParticipantPickerVisible = false,
        isPolicyExpenseChat = false,
        iouType = CONST.IOU.TYPE.SUBMIT,
        action = CONST.IOU.ACTION.CREATE,
        policyID,
        onConfirm,
        onToggleBillable,
        onToggleReimbursable,
        receiptOptions,
    } = props;

    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);

    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);

    // The distance state needs the policy before the shared data hook runs, so this surface resolves it itself.
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest: false,
    });

    const distanceState = useDistanceRequestState({
        transaction,
        policy,
        policyID,
        policyForMovingExpenses,
        isMovingTransactionFromTrackExpense,
        isDistanceRequest: true,
        isPolicyExpenseChat,
        iouAmount,
        iouCurrencyCode,
    });
    const {mileageRate, unit, currency, distance, hasRoute, isDistanceRequestWithPendingRoute} = distanceState;

    // A distance request can be blocked before submission by a missing home address, or by a policy that requires
    // a map or GPS, so the guard wraps this surface's own confirm callback.
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const data = useConfirmationListData({
        ...props,
        isDistanceRequest: true,
        distanceState,
        onConfirm: () => {
            if (blockDistanceRequestIfNeeded()) {
                return;
            }
            onConfirm?.();
        },
    });

    const shouldShowRateAutoUpdatedTooltip =
        !!transaction?.comment?.customUnit?.rateAutoUpdated && !!transaction.created && DistanceRequestUtils.isRateEligibleForDate(mileageRate, transaction.created);

    const footerProps = {
        policy: data.policy,
        policyTags: data.policyTags,
        selectedParticipants,
        distanceData: {
            distance,
            // The distance field reads this to decide whether it has a figure worth showing, so a
            // pending route (or a commuter exclusion still being decided) reads as not having one.
            hasRoute: hasRoute && !isDistanceRequestWithPendingRoute,
            unit,
            distanceRateName: mileageRate.name,
            distanceRateCurrency: currency,
            mileageRate,
            expenseDate: getCreated(transaction),
            customUnitRateID: data.customUnitRateID,
            shouldShowRateAutoUpdatedTooltip,
            customUnit: transaction?.comment?.customUnit,
        },
        amountDisplay: data.amountDisplay,
        requiredFlags: data.requiredFlags,
        visibilityFlags: {...data.visibilityFlags, isParticipantPickerVisible},
        errorState: data.errorState,
        toggleHandlers: {onToggleReimbursable, onToggleBillable},
        receiptOptions,
    };

    // Ordered as the footer dispatcher ordered them. A transaction carries a single request type, so at most one
    // of these matches.
    const renderFooter = () => {
        if (isManualDistanceRequest) {
            return <DistanceManualFooter {...footerProps} />;
        }
        if (isOdometerDistanceRequest) {
            return (
                <DistanceOdometerFooter
                    {...footerProps}
                    receiptStitchError={receiptStitchError}
                />
            );
        }
        // `DISTANCE`, `DISTANCE_MAP` and `DISTANCE_GPS` all confirm against the route map.
        return <DistanceMapFooter {...footerProps} />;
    };

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isDistanceRequest
            isManualDistanceRequest={isManualDistanceRequest}
            isOdometerDistanceRequest={isOdometerDistanceRequest}
            isGPSDistanceRequest={isGPSDistanceRequest}
            onTaxAmountEmptyChange={data.setIsTaxAmountEmpty}
        >
            <View>{renderFooter()}</View>
        </ConfirmationFieldsProvider>
    );

    return (
        <ConfirmationDataContext.Provider value={data}>
            <TaxController distanceState={distanceState} />
            <DistanceRequestController distanceState={distanceState} />
            <SplitBillController />
            <FieldAutoSelector />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </ConfirmationDataContext.Provider>
    );
}

export default DistanceConfirmationList;
