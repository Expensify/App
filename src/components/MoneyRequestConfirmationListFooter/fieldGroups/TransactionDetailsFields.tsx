import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';
import RateField from '@components/MoneyRequestConfirmationList/sections/RateField';
import TimeFields from '@components/MoneyRequestConfirmationList/sections/TimeFields';
import type {AmountDisplay, DistanceData, ErrorState, RequiredFlags} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {FieldVisibility} from './fieldVisibility';

type TransactionDetailsFieldsProps = {
    /** Active policy (read by Amount/Description/Rate/Merchant) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values consumed by Amount/Attendee fields */
    amountDisplay: AmountDisplay;

    /** Distance-rate metadata threaded into Distance/Rate fields */
    distanceData: DistanceData;

    /** Per-field "required" flags driven by policy/workflow */
    requiredFlags: RequiredFlags;

    /** Error state surfaced into Amount/Merchant */
    errorState: ErrorState;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** When true, suppresses the below-show-more entries (Amount, Rate, Merchant, Time) */
    isCompactMode: boolean;

    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'amount' | 'distance' | 'rate' | 'merchant' | 'time'>;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow). Drives amount autofocus on picker close. */
    isParticipantPickerVisible: boolean;
};

function TransactionDetailsFields({
    policy,
    amountDisplay,
    distanceData,
    requiredFlags,
    errorState,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    iouCurrencyCode,
    isCompactMode,
    fieldVisibility,
    isParticipantPickerVisible,
}: TransactionDetailsFieldsProps) {
    const {
        action,
        iouType,
        transactionID,
        reportID,
        reportActionID,
        isReadOnly,
        didConfirm,
        isNewManualExpenseFlowEnabled,
        isPolicyExpenseChat,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isGPSDistanceRequest,
    } = useConfirmationFields();
    const shouldAutoFocusAmountField = !canUseTouchScreen();

    return (
        <>
            {!isCompactMode && fieldVisibility.amount && (
                <AmountField
                    action={action}
                    amount={amountDisplay.amount}
                    formattedAmount={amountDisplay.formattedAmount}
                    distanceRateCurrency={distanceData.distanceRateCurrency}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={fieldVisibility.distance}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    shouldShowTimeRequestFields={fieldVisibility.time}
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    formError={errorState.formError}
                    transactionID={transactionID}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    policy={policy}
                    clearFormErrors={errorState.clearFormErrors}
                    setFormError={errorState.setFormError}
                    autoFocus={shouldAutoFocusAmountField}
                    isParticipantPickerVisible={isParticipantPickerVisible}
                />
            )}

            {!isCompactMode && fieldVisibility.merchant && (
                <MerchantField
                    isMerchantRequired={requiredFlags.isMerchantRequired}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    formError={errorState.formError}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            )}

            <DescriptionField
                isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                isReadOnly={isReadOnly}
                didConfirm={didConfirm}
                isDescriptionRequired={requiredFlags.isDescriptionRequired}
                transactionID={transactionID}
                action={action}
                iouType={iouType}
                reportID={reportID}
                reportActionID={reportActionID}
                policy={policy}
            />

            {fieldVisibility.distance && (
                <DistanceField
                    hasRoute={distanceData.hasRoute}
                    distance={distanceData.distance}
                    unit={distanceData.unit}
                    isManualDistanceRequest={isManualDistanceRequest}
                    isOdometerDistanceRequest={isOdometerDistanceRequest}
                    isGPSDistanceRequest={isGPSDistanceRequest}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    customUnit={distanceData.customUnit}
                />
            )}

            {!isCompactMode && fieldVisibility.rate && (
                <RateField
                    distanceRateName={distanceData.distanceRateName}
                    distanceRateCurrency={distanceData.distanceRateCurrency}
                    unit={distanceData.unit}
                    rate={distanceData.rate}
                    mileageRate={distanceData.mileageRate}
                    expenseDate={distanceData.expenseDate}
                    customUnitRateID={distanceData.customUnitRateID}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    policy={policy}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    formError={errorState.formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                    shouldShowRateAutoUpdatedTooltip={distanceData.shouldShowRateAutoUpdatedTooltip}
                />
            )}

            {!isCompactMode && fieldVisibility.time && (
                <TimeFields
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            )}
        </>
    );
}

export default TransactionDetailsFields;
