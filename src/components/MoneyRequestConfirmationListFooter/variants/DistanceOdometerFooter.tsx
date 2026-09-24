import FormHelpMessage from '@components/FormHelpMessage';
import ExpenseFormLayoutContext from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/DistanceDetailsFields';
import useAddReceiptLayout from '@components/MoneyRequestConfirmationListFooter/hooks/useAddReceiptLayout';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
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

    // The add-receipt button and the spacing around the preview both key off whether the section shows a receipt.
    const {expenseFormLayout, hasReceipt} = useAddReceiptLayout(policy, receiptOptions);

    return (
        <ExpenseFormLayoutContext.Provider value={expenseFormLayout}>
            <View>
                {/*
                    Separates the workspace row above from the expense details, so the two read as distinct sections.
                    Its 8px of margin is what puts an even 16px between every pair of items in the form, since each
                    field already carries 8px of its own.
                */}
                {visibilityFlags.hasParticipantSection && <View style={[styles.dividerLine, styles.mv2]} />}

                {/* The receipt preview carries no margin of its own, so the 8px that keeps it clear of the divider
                    above and of the first field below it goes here. */}
                <View style={hasReceipt ? styles.mv2 : undefined}>
                    <ReceiptSection
                        policy={policy}
                        shouldHideEmptyState
                        {...receiptOptions}
                    />
                </View>

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
        </ExpenseFormLayoutContext.Provider>
    );
}

export default DistanceOdometerFooter;
