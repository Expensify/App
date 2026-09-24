import FormHelpMessage from '@components/FormHelpMessage';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/DistanceDetailsFields';
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

    return (
        <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
            <View>
                {/*
                    Separates the workspace row above from the expense details, so the two read as distinct sections.
                    Its 8px of margin is what puts an even 16px between every pair of items in the form, since each
                    field already carries 8px of its own.
                */}
                {visibilityFlags.hasParticipantSection && <View style={[styles.dividerLine, styles.mv2]} />}

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
        </ExpenseFormLayoutContext.Provider>
    );
}

export default DistanceOdometerFooter;
