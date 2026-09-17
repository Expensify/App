import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import PerDiemSection from '@components/MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import type {PerDiemFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import React from 'react';
import {View} from 'react-native';

function PerDiemFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}}: PerDiemFooterProps) {
    return (
        <View>
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
    );
}

export default PerDiemFooter;
