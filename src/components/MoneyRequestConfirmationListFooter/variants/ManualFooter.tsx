import ExpenseFormLayoutContext from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/ManualDetailsFields';
import useAddReceiptLayout from '@components/MoneyRequestConfirmationListFooter/hooks/useAddReceiptLayout';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {ManualFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for manually entered expenses, and the dispatcher's residual case: it also serves pay, per-diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense.
 *
 * This is the one form that gives every selectable row the same bordered treatment as its text fields, so the
 * whole section reads as one set of details rather than as several lists stacked together. It says so once, by
 * providing the layout its fields read, rather than by handing the decision to each of them.
 */
function ManualFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: ManualFooterProps) {
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
            </View>
        </ExpenseFormLayoutContext.Provider>
    );
}

export default ManualFooter;
