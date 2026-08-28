import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import TimeDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/TimeDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {TimeFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';
import {View} from 'react-native';

function TimeFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: TimeFooterProps) {
    return (
        <View>
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
                <TimeDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    isDescriptionRequired={requiredFlags.isDescriptionRequired}
                    errorState={errorState}
                />
            </ConfirmationFieldList>
        </View>
    );
}

export default TimeFooter;
