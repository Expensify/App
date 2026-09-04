import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import {useDetailsFields} from '@components/MoneyRequestConfirmationListFooter/DetailsFieldsContext';
import type {AmountDisplay, ErrorState} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ConfirmationAmountFieldProps = {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Error state surfaced into the amount input */
    errorState: ErrorState;

    /** Whether the amount is a distance rate rather than a currency amount */
    isDistanceRequest: boolean;

    /** Whether the time-request breakdown accompanies the amount */
    shouldShowTimeRequestFields: boolean;

    /** Distance-rate currency, used when isDistanceRequest is true */
    distanceRateCurrency?: string;

    /** Whether the parent-owned participant picker is open, so the amount refocuses when it closes */
    isParticipantPickerVisible?: boolean;
};

/** The confirmation amount input with the footer's shared focus and error policy, so every footer variant renders it identically. */
function ConfirmationAmountField({
    policy,
    amountDisplay,
    errorState,
    isDistanceRequest,
    shouldShowTimeRequestFields,
    distanceRateCurrency,
    isParticipantPickerVisible,
}: ConfirmationAmountFieldProps) {
    const {iouCurrencyCode} = useDetailsFields();

    return (
        <AmountField
            amount={amountDisplay.amount}
            formattedAmount={amountDisplay.formattedAmount}
            distanceRateCurrency={distanceRateCurrency}
            iouCurrencyCode={iouCurrencyCode}
            isDistanceRequest={isDistanceRequest}
            shouldShowTimeRequestFields={shouldShowTimeRequestFields}
            shouldDisplayFieldError={errorState.shouldDisplayFieldError}
            formError={errorState.formError}
            policy={policy}
            clearFormErrors={errorState.clearFormErrors}
            setFormError={errorState.setFormError}
            autoFocus={!canUseTouchScreen()}
            isParticipantPickerVisible={isParticipantPickerVisible}
        />
    );
}

export default ConfirmationAmountField;
