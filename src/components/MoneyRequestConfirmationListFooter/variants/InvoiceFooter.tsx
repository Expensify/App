import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/ManualDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {InvoiceFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';
import {View} from 'react-native';

function InvoiceFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: InvoiceFooterProps) {
    return (
        <View>
            <InvoiceSenderField selectedParticipants={selectedParticipants} />

            <ReceiptSection
                policy={policy}
                {...receiptOptions}
            />

            <ConfirmationFieldList
                policy={policy}
                policyTags={policyTags}
                selectedParticipants={selectedParticipants}
                amountDisplay={amountDisplay}
                requiredFlags={requiredFlags}
                visibilityFlags={visibilityFlags}
                errorState={errorState}
                toggleHandlers={toggleHandlers}
            >
                <ManualDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    errorState={errorState}
                    isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
                />
            </ConfirmationFieldList>
        </View>
    );
}

export default InvoiceFooter;
