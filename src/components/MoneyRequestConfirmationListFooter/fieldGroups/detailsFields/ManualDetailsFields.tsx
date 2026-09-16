import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';
import {useDetailsFields} from '@components/MoneyRequestConfirmationListFooter/DetailsFieldsContext';
import type {AmountDisplay, ErrorState, RequiredFlags} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type * as OnyxTypes from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ManualDetailsFieldsProps = {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags driven by policy/workflow */
    requiredFlags: RequiredFlags;

    /** Error state */
    errorState: ErrorState;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow) */
    isParticipantPickerVisible: boolean;

    /** Action rendered beside the amount field, e.g. the compact add-receipt button of the manual form */
    amountTrailingAction?: ReactNode;

    /** Renders the amount field's flip and currency buttons without their pill background */
    shouldUseBorderlessAmountButtons?: boolean;
};

/**
 * The expense-type-driven fields for a manual, scanned or invoice confirmation: Amount, Merchant and Description.
 */
function ManualDetailsFields({
    policy,
    amountDisplay,
    requiredFlags,
    errorState,
    isParticipantPickerVisible,
    amountTrailingAction,
    shouldUseBorderlessAmountButtons = false,
}: ManualDetailsFieldsProps) {
    const {fieldVisibility, isCompactMode, iouCurrencyCode} = useDetailsFields();

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
                    trailingAction={amountTrailingAction}
                    shouldUseBorderlessButtons={shouldUseBorderlessAmountButtons}
                    {...errorState}
                />
            )}

            {!isCompactMode && fieldVisibility.merchant && (
                <MerchantField
                    isMerchantRequired={requiredFlags.isMerchantRequired}
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    formError={errorState.formError}
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
