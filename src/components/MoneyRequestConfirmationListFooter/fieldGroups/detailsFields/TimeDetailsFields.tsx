import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import TimeFields from '@components/MoneyRequestConfirmationList/sections/TimeFields';
import {useDetailsFields} from '@components/MoneyRequestConfirmationListFooter/DetailsFieldsContext';
import type {AmountDisplay, ErrorState} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TimeDetailsFieldsProps = {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Whether a description is required by the selected category */
    isDescriptionRequired: boolean;

    /** Error state surfaced into Amount */
    errorState: ErrorState;
};

function TimeDetailsFields({policy, amountDisplay, isDescriptionRequired, errorState}: TimeDetailsFieldsProps) {
    const {fieldVisibility, iouCurrencyCode} = useDetailsFields();

    return (
        <>
            {fieldVisibility.amount && (
                <AmountField
                    amount={amountDisplay.amount}
                    formattedAmount={amountDisplay.formattedAmount}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={false}
                    shouldShowTimeRequestFields
                    policy={policy}
                    {...errorState}
                />
            )}

            <DescriptionField
                isDescriptionRequired={isDescriptionRequired}
                policy={policy}
            />

            <TimeFields />
        </>
    );
}

export default TimeDetailsFields;
