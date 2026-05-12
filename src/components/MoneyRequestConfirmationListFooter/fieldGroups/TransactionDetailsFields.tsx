import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';
import RateField from '@components/MoneyRequestConfirmationList/sections/RateField';
import TimeFields from '@components/MoneyRequestConfirmationList/sections/TimeFields';
import type CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type {FieldVisibility} from './fieldVisibility';

type TransactionDetailsFieldsProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether the new manual expense flow beta is enabled */
    isNewManualExpenseFlowEnabled: boolean;

    /** Whether we're editing an existing split expense */
    isEditingSplitBill: boolean;

    /** Whether the surface is in a policy-expense chat */
    isPolicyExpenseChat: boolean;

    /** Whether the active transaction is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer-driven distance request */
    isOdometerDistanceRequest: boolean;

    /** Whether the active transaction is a GPS-driven distance request */
    isGPSDistanceRequest: boolean;

    /** Whether the merchant is required to submit */
    isMerchantRequired: boolean | undefined;

    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'amount' | 'distance' | 'rate' | 'merchant' | 'time'>;

    /** Whether the description is required to submit */
    isDescriptionRequired: boolean;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** Total amount, in the smallest currency unit */
    amount: number;

    /** Pre-formatted amount string for display */
    formattedAmount: string;

    /** Distance value */
    distance: number;

    /** Whether a route is available */
    hasRoute: boolean;

    /** Distance unit */
    unit: Unit | undefined;

    /** Distance rate (per-unit cost) */
    rate: number | undefined;

    /** Display name of the active distance rate */
    distanceRateName: string | undefined;

    /** Currency of the active distance rate */
    distanceRateCurrency: string;

    /** When true, suppresses the below-show-more entries (Amount, Rate, Merchant, Time) */
    isCompactMode: boolean;
};

function TransactionDetailsFields({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    transaction,
    policy,
    isReadOnly,
    didConfirm,
    isNewManualExpenseFlowEnabled,
    isEditingSplitBill,
    isPolicyExpenseChat,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isGPSDistanceRequest,
    isMerchantRequired,
    isDescriptionRequired,
    shouldDisplayFieldError,
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    iouCurrencyCode,
    amount,
    formattedAmount,
    distance,
    hasRoute,
    unit,
    rate,
    distanceRateName,
    distanceRateCurrency,
    isCompactMode,
    fieldVisibility,
}: TransactionDetailsFieldsProps) {
    return (
        <>
            {!isCompactMode && fieldVisibility.amount && (
                <AmountField
                    action={action}
                    amount={amount}
                    formattedAmount={formattedAmount}
                    distanceRateCurrency={distanceRateCurrency}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={fieldVisibility.distance}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    shouldShowTimeRequestFields={fieldVisibility.time}
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    formError={formError}
                    transaction={transaction}
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
                isDescriptionRequired={isDescriptionRequired}
                transactionID={transactionID}
                action={action}
                iouType={iouType}
                reportID={reportID}
                reportActionID={reportActionID}
                policy={policy}
                transaction={transaction}
                isEditingSplitBill={isEditingSplitBill}
            />

            {fieldVisibility.distance && (
                <DistanceField
                    hasRoute={hasRoute}
                    distance={distance}
                    unit={unit}
                    rate={rate}
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
                />
            )}

            {!isCompactMode && fieldVisibility.rate && (
                <RateField
                    distanceRateName={distanceRateName}
                    distanceRateCurrency={distanceRateCurrency}
                    unit={unit}
                    rate={rate}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    policy={policy}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    formError={formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                />
            )}

            {!isCompactMode && fieldVisibility.merchant && (
                <MerchantField
                    isMerchantRequired={isMerchantRequired}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    formError={formError}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    transaction={transaction}
                    isEditingSplitBill={isEditingSplitBill}
                />
            )}

            {!isCompactMode && fieldVisibility.time && (
                <TimeFields
                    transaction={transaction}
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
