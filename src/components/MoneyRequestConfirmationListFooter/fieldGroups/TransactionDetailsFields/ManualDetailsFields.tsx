import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';
import {useDetailsFields} from '@components/MoneyRequestConfirmationListFooter/DetailsFieldsContext';
import type {AmountDisplay, ErrorState, RequiredFlags} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ManualDetailsFieldsProps = {
    /** Active policy (read by Amount/Description) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags driven by policy/workflow */
    requiredFlags: RequiredFlags;

    /** Error state surfaced into Amount/Merchant */
    errorState: ErrorState;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow) */
    isParticipantPickerVisible: boolean;
};

/**
 * The expense-type-driven fields for a manual or scanned expense: Amount, Merchant and Description.
 *
 * Shared by `ManualFooter` and `ScanFooter`, which render the same fields and differ only in compact mode.
 * `isCompactMode` is always false outside scan, so the guards below are inert for the manual variant.
 * Distance, Rate and the Time fields belong to other expense types, so no data for them is threaded here.
 */
function ManualDetailsFields({policy, amountDisplay, requiredFlags, errorState, isParticipantPickerVisible}: ManualDetailsFieldsProps) {
    const {fieldVisibility, isCompactMode, iouCurrencyCode} = useDetailsFields();
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isNewManualExpenseFlowEnabled} = useConfirmationFields();

    return (
        <>
            {!isCompactMode && fieldVisibility.amount && (
                <AmountField
                    amount={amountDisplay.amount}
                    formattedAmount={amountDisplay.formattedAmount}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={false}
                    shouldShowTimeRequestFields={false}
                    policy={policy}
                    isParticipantPickerVisible={isParticipantPickerVisible}
                    {...errorState}
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
                isDescriptionRequired={requiredFlags.isDescriptionRequired}
                policy={policy}
            />
        </>
    );
}

export default ManualDetailsFields;
