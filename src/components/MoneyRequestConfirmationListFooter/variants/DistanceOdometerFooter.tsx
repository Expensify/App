import FormHelpMessage from '@components/FormHelpMessage';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ExpenseFormFooterLayout from '@components/MoneyRequestConfirmationListFooter/ExpenseFormFooterLayout';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/DistanceDetailsFields';
import type {DistanceOdometerFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for odometer distance expenses. The only variant that can surface a stitch error: the odometer flow builds one receipt from the start and end photos.
 */
function DistanceOdometerFooter({
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
    receiptStitchError,
}: DistanceOdometerFooterProps) {
    const styles = useThemeStyles();

    return (
        <ExpenseFormFooterLayout
            policy={policy}
            receiptOptions={receiptOptions}
            hasParticipantSection={visibilityFlags.hasParticipantSection}
        >
            {!!receiptStitchError && (
                <View style={styles.mh5}>
                    <FormHelpMessage message={receiptStitchError} />
                </View>
            )}

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

export default DistanceOdometerFooter;
