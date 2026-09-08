import FormHelpMessage from '@components/FormHelpMessage';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import TransactionDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields';
import DistanceMapSection from '@components/MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import InvoiceSenderSection from '@components/MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/**
 * Fallback footer for expense types that have not been extracted yet. Deleted once the last one has a variant.
 */
function DefaultFooter({
    receiptStitchError,
    isCompactMode,
    policy,
    policyTags,
    selectedParticipants,
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers,
    receiptOptions,
    compactControls,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const {showMoreFields, setShowMoreFields} = compactControls;

    return (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <View>
                <InvoiceSenderSection selectedParticipants={selectedParticipants} />
                <DistanceMapSection />
            </View>

            <ReceiptSection
                policy={policy}
                showMoreFields={showMoreFields}
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
                toggleHandlers={toggleHandlers ?? {}}
                compactState={{isCompactMode, setShowMoreFields}}
            >
                <TransactionDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    distanceData={distanceData}
                    requiredFlags={requiredFlags}
                    errorState={errorState}
                    isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
                />
            </ConfirmationFieldList>
        </View>
    );
}

export default DefaultFooter;
