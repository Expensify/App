import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import TimeFields from '@components/MoneyRequestConfirmationList/sections/TimeFields';
import type {AmountDisplay, DetailsFieldsProps, ErrorState} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TimeDetailsFieldsProps = DetailsFieldsProps & {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Whether a description is required by the selected category */
    isDescriptionRequired: boolean;

    /** Error state surfaced into Amount */
    errorState: ErrorState;
};

function TimeDetailsFields({policy, amountDisplay, isDescriptionRequired, errorState, fieldVisibility, iouCurrencyCode}: TimeDetailsFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isNewManualExpenseFlowEnabled} = useConfirmationFields();
    const shouldAutoFocusAmountField = !canUseTouchScreen();

    return (
        <>
            {fieldVisibility.amount && (
                <AmountField
                    action={action}
                    amount={amountDisplay.amount}
                    formattedAmount={amountDisplay.formattedAmount}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={false}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    shouldShowTimeRequestFields
                    transactionID={transactionID}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    policy={policy}
                    autoFocus={shouldAutoFocusAmountField}
                    {...errorState}
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
            />

            <TimeFields
                isReadOnly={isReadOnly}
                didConfirm={didConfirm}
                transactionID={transactionID}
                action={action}
                iouType={iouType}
                reportID={reportID}
                reportActionID={reportActionID}
            />
        </>
    );
}

export default TimeDetailsFields;
