import FormHelpMessage from '@components/FormHelpMessage';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/DistanceDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {DistanceOdometerFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

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
        <View>
            <ReceiptSection
                policy={policy}
                {...receiptOptions}
            />

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
                    errorState={errorState}
                />
            </ConfirmationFieldList>
        </View>
    );
}

export default DistanceOdometerFooter;
