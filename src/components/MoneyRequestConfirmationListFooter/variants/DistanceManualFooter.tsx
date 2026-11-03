import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ExpenseFormFooterLayout from '@components/MoneyRequestConfirmationListFooter/ExpenseFormFooterLayout';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/DistanceDetailsFields';
import type {DistanceFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';

/** Footer for manually entered distance expenses. */
function DistanceManualFooter({
    policy,
    policyTags,
    selectedParticipants,
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers = {},
    receiptOptions,
}: DistanceFooterProps) {
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
                <DistanceDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    distanceData={distanceData}
                    isDescriptionRequired={requiredFlags.isDescriptionRequired}
                    descriptionHint={requiredFlags.descriptionHint}
                    errorState={errorState}
                />
            </ConfirmationFieldList>
        </ExpenseFormFooterLayout>
    );
}

export default DistanceManualFooter;
