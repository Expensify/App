import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import PerDiemSection from '@components/MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import type {PerDiemFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

function PerDiemFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}}: PerDiemFooterProps) {
    const styles = useThemeStyles();

    return (
        <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
            <View>
                {visibilityFlags.hasParticipantSection && <View style={[styles.dividerLine, styles.mv2]} />}

                <PerDiemSection
                    policy={policy}
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    formError={errorState.formError}
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
                    <DescriptionField
                        policy={policy}
                        isDescriptionRequired={requiredFlags.isDescriptionRequired}
                    />
                </ConfirmationFieldList>
            </View>
        </ExpenseFormLayoutContext.Provider>
    );
}

export default PerDiemFooter;
