import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import PerDiemFooter from '@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter';

import React from 'react';
import {View} from 'react-native';

/** Confirms a per-diem expense. */
function PerDiemConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {selectedParticipants, onToggleBillable, onToggleReimbursable} = props;

    const data = useConfirmationListData({...props, isPerDiemRequest: true});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isPerDiemRequest
        >
            <View>
                <PerDiemFooter
                    policy={data.policy}
                    policyTags={data.policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={data.amountDisplay}
                    requiredFlags={data.requiredFlags}
                    visibilityFlags={data.visibilityFlags}
                    errorState={data.errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <ConfirmationDataContext.Provider value={data}>
            <FieldAutoSelector />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </ConfirmationDataContext.Provider>
    );
}

export default PerDiemConfirmationList;
