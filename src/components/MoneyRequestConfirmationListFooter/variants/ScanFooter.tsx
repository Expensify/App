import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/ManualDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {ScanFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for scanned expenses. The only variant that reaches compact mode, where the receipt fills the screen
 * and the optional fields collapse behind a show-more button.
 */
function ScanFooter({
    isCompactMode,
    policy,
    policyTags,
    selectedParticipants,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers = {},
    receiptOptions,
    compactControls,
}: ScanFooterProps) {
    const styles = useThemeStyles();
    const {showMoreFields, setShowMoreFields} = compactControls;

    return (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <ReceiptSection
                policy={policy}
                showMoreFields={showMoreFields}
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
                compactState={{isCompactMode, setShowMoreFields}}
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
    );
}

export default ScanFooter;
