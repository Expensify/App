import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {TimeConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import TimeFooter from '@components/MoneyRequestConfirmationListFooter/variants/TimeFooter';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a time expense being created.
 *
 * A time expense is never a distance or scan request and never enters the compact layout, so this mounts no
 * distance controller. It skips the tax controller too: `isTaxTrackingEnabled` returns false for time, so the tax
 * field can never be shown here. It is never a split either, so no split controller.
 *
 * Only the CREATE action reaches this. Outside CREATE a time expense shows Merchant and hides the hours/rate
 * fields, which is what the manual confirmation renders anyway.
 */
function TimeConfirmationList(props: TimeConfirmationListProps) {
    const {selectedParticipants, onToggleBillable, onToggleReimbursable, receiptOptions} = props;

    const data = useConfirmationListData({...props, isTimeRequest: true});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isTimeRequest
        >
            <View>
                <TimeFooter
                    policy={data.policy}
                    policyTags={data.policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={data.amountDisplay}
                    requiredFlags={data.requiredFlags}
                    visibilityFlags={data.visibilityFlags}
                    errorState={data.errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                    receiptOptions={receiptOptions}
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

export default TimeConfirmationList;
