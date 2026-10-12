import ExpenseFormLayoutContext from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type * as OnyxTypes from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {ReceiptOptions} from './fieldGroupTypes';

import useAddReceiptLayout from './hooks/useAddReceiptLayout';
import ReceiptSection from './sections/ReceiptSection';

type ExpenseFormFooterLayoutProps = {
    /** The policy the expense is being created on */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Options for the receipt preview shown above the fields */
    receiptOptions: ReceiptOptions;

    /** Whether the participant section is shown above the footer, which needs a divider to separate it */
    hasParticipantSection: boolean;

    /** The variant-specific content rendered below the receipt preview */
    children: ReactNode;
};

/**
 * The layout shared by the confirmation footers that offer the compact add-receipt button (manual, time, manual
 * distance and odometer): the participant divider, the receipt preview and its spacing, and the form layout their
 * fields read. Each variant renders only what is unique to it as `children`.
 */
function ExpenseFormFooterLayout({policy, receiptOptions, hasParticipantSection, children}: ExpenseFormFooterLayoutProps) {
    const styles = useThemeStyles();

    // The add-receipt button and the spacing around the preview both key off whether the section shows a receipt.
    const {expenseFormLayout, hasReceipt} = useAddReceiptLayout(policy, receiptOptions);

    return (
        <ExpenseFormLayoutContext.Provider value={expenseFormLayout}>
            <View>
                {hasParticipantSection && <View style={[styles.dividerLine, styles.mv2]} />}

                {/* The receipt preview carries no margin of its own, so the 8px that keeps it clear of the divider
                    above and of the first field below it goes here. */}
                <View style={hasReceipt ? styles.mv2 : undefined}>
                    <ReceiptSection
                        policy={policy}
                        shouldHideEmptyState
                        {...receiptOptions}
                    />
                </View>

                {children}
            </View>
        </ExpenseFormLayoutContext.Provider>
    );
}

export default ExpenseFormFooterLayout;
