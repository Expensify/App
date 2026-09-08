import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/ManualDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {ManualFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for manually entered expenses, and the dispatcher's residual case: it also serves pay, per-diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense.
 */
function ManualFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: ManualFooterProps) {
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

export default ManualFooter;
