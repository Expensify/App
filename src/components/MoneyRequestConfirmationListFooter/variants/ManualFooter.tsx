import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ExpenseFormFooterLayout from '@components/MoneyRequestConfirmationListFooter/ExpenseFormFooterLayout';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/ManualDetailsFields';
import type {ManualFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';

/**
 * Footer for manually entered expenses, and the dispatcher's residual case: it also serves pay, per-diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense.
 *
 * This is the one form that gives every selectable row the same bordered treatment as its text fields, so the
 * whole section reads as one set of details rather than as several lists stacked together. It says so once, by
 * providing the layout its fields read, rather than by handing the decision to each of them.
 */
function ManualFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: ManualFooterProps) {
    return (
        <ExpenseFormFooterLayout
            policy={policy}
            receiptOptions={receiptOptions}
            hasParticipantSection={visibilityFlags.hasParticipantSection}
        >
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
        </ExpenseFormFooterLayout>
    );
}

export default ManualFooter;
