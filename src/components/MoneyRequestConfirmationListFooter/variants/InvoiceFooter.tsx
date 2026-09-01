import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/ManualDetailsFields';
import InvoiceSenderSection from '@components/MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {InvoiceFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for invoices. An invoice is always a manual expense (the request-type tabs are not offered for it),
 * so it renders the same fields as `ManualFooter` and adds the sender row on top.
 */
function InvoiceFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: InvoiceFooterProps) {
    return (
        <View>
            <InvoiceSenderSection selectedParticipants={selectedParticipants} />

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
