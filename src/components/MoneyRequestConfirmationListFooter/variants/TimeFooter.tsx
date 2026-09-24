import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import TimeDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/TimeDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {TimeFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

function TimeFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: TimeFooterProps) {
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
                        errorState={errorState}
                    />
                </ConfirmationFieldList>
            </View>
        </ExpenseFormLayoutContext.Provider>
    );
}

export default TimeFooter;
