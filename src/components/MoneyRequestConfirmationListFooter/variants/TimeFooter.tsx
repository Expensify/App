import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ExpenseFormFooterLayout from '@components/MoneyRequestConfirmationListFooter/ExpenseFormFooterLayout';
import TimeDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/TimeDetailsFields';
import type {TimeFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';

function TimeFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: TimeFooterProps) {
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
                <TimeDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    isDescriptionRequired={requiredFlags.isDescriptionRequired}
                    descriptionHint={requiredFlags.descriptionHint}
                    errorState={errorState}
                />
            </ConfirmationFieldList>
        </ExpenseFormFooterLayout>
    );
}

export default TimeFooter;
