import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';
import RateField from '@components/MoneyRequestConfirmationList/sections/RateField';
import TimeFields from '@components/MoneyRequestConfirmationList/sections/TimeFields';
import type {AmountDisplay, DistanceData, DistanceFlags, ErrorState, RequiredFlags} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';
import type * as OnyxTypes from '@src/types/onyx';
import type {FieldVisibility} from './fieldVisibility';

type TransactionDetailsFieldsProps = {
    /** Active policy (read by Amount/Description/Rate/Merchant) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Distance-mode discriminators (manual / odometer / GPS) */
    distanceFlags: DistanceFlags;

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
};

function TransactionDetailsFields({
    policy,
    distanceFlags,
    amountDisplay,
    distanceData,
    requiredFlags,
    errorState,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    iouCurrencyCode,
    isCompactMode,
    fieldVisibility,
}: TransactionDetailsFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isEditingSplitBill, isNewManualExpenseFlowEnabled, isPolicyExpenseChat} =
        useConfirmationFields();

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
                    isEditingSplitBill={isEditingSplitBill}
                    policy={policy}
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
                isEditingSplitBill={isEditingSplitBill}
            />

            {fieldVisibility.distance && (
                <DistanceField
                    hasRoute={distanceData.hasRoute}
                    distance={distanceData.distance}
                    unit={distanceData.unit}
                    rate={distanceData.rate}
                    isManualDistanceRequest={distanceFlags.isManualDistanceRequest}
                    isOdometerDistanceRequest={distanceFlags.isOdometerDistanceRequest}
                    isGPSDistanceRequest={distanceFlags.isGPSDistanceRequest}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            )}

            {!isCompactMode && fieldVisibility.rate && (
                <RateField
                    distanceRateName={distanceData.distanceRateName}
                    distanceRateCurrency={distanceData.distanceRateCurrency}
                    unit={distanceData.unit}
                    rate={distanceData.rate}
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
                    isEditingSplitBill={isEditingSplitBill}
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
