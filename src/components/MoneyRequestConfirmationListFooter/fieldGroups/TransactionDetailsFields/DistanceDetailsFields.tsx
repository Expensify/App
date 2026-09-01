import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';
import RateField from '@components/MoneyRequestConfirmationList/sections/RateField';
import {useDetailsFields} from '@components/MoneyRequestConfirmationListFooter/DetailsFieldsContext';
import type {AmountDisplay, DistanceData, ErrorState} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type DistanceDetailsFieldsProps = {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Distance-rate metadata */
    distanceData: DistanceData;

    /** Whether a description is required by the selected category */
    isDescriptionRequired: boolean;

    /** Error state surfaced into Amount */
    errorState: ErrorState;
};

function DistanceDetailsFields({policy, amountDisplay, distanceData, isDescriptionRequired, errorState}: DistanceDetailsFieldsProps) {
    const {fieldVisibility, iouCurrencyCode, shouldNavigateToUpgradePath, shouldSelectPolicy} = useDetailsFields();

    return (
        <>
            {fieldVisibility.amount && (
                <AmountField
                    amount={amountDisplay.amount}
                    formattedAmount={amountDisplay.formattedAmount}
                    distanceRateCurrency={distanceData.distanceRateCurrency}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest
                    shouldShowTimeRequestFields={false}
                    policy={policy}
                    {...errorState}
                />
            )}

            <DescriptionField
                isDescriptionRequired={isDescriptionRequired}
                policy={policy}
            />

            <DistanceField
                hasRoute={distanceData.hasRoute}
                distance={distanceData.distance}
                unit={distanceData.unit}
                customUnit={distanceData.customUnit}
            />

            <RateField
                distanceRateName={distanceData.distanceRateName}
                distanceRateCurrency={distanceData.distanceRateCurrency}
                unit={distanceData.unit}
                mileageRate={distanceData.mileageRate}
                expenseDate={distanceData.expenseDate}
                customUnitRateID={distanceData.customUnitRateID}
                policy={policy}
                formError={errorState.formError}
                shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                shouldSelectPolicy={shouldSelectPolicy}
                shouldShowRateAutoUpdatedTooltip={distanceData.shouldShowRateAutoUpdatedTooltip}
            />
        </>
    );
}

export default DistanceDetailsFields;
