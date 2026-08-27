import FormHelpMessage from '@components/FormHelpMessage';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import TransactionDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields';
import DistanceMapSection from '@components/MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import InvoiceSenderSection from '@components/MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const noopSetShowMoreFields = () => {};

/**
 * Fallback footer that renders every section for every expense type, exactly as the single footer
 * component did before the split. Each expense type migrates to its own variant one PR at a time;
 * this stays as the dispatcher's fallback until the last one lands, then it is deleted.
 */
function DefaultFooter({
    receiptStitchError,
    isScanRequest,
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
    const isInLandscapeMode = useIsInLandscapeMode();

    const showMoreFields = compactControls?.showMoreFields ?? false;
    const setShowMoreFields = compactControls?.setShowMoreFields ?? noopSetShowMoreFields;
    const isCompactMode = !showMoreFields && isScanRequest && !isInLandscapeMode;

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
                renderTransactionDetailsFields={(props) => (
                    <TransactionDetailsFields
                        {...props}
                        policy={policy}
                        amountDisplay={amountDisplay}
                        distanceData={distanceData}
                        requiredFlags={requiredFlags}
                        errorState={errorState}
                        isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
                    />
                )}
            />
        </View>
    );
}

export default DefaultFooter;
