import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import DistanceDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/DistanceDetailsFields';
import DistanceMapSection from '@components/MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {DistanceFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** Footer for distance expenses that can show a route map */
function DistanceMapFooter({
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
}: DistanceFooterProps) {
    const styles = useThemeStyles();

    return (
        <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
            <View>
                {visibilityFlags.hasParticipantSection && <View style={[styles.dividerLine, styles.mv2]} />}

                <DistanceMapSection />

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
                    <DistanceDetailsFields
                        policy={policy}
                        amountDisplay={amountDisplay}
                        distanceData={distanceData}
                        isDescriptionRequired={requiredFlags.isDescriptionRequired}
                        descriptionHint={requiredFlags.descriptionHint}
                        errorState={errorState}
                    />
                </ConfirmationFieldList>
            </View>
        </ExpenseFormLayoutContext.Provider>
    );
}

export default DistanceMapFooter;
