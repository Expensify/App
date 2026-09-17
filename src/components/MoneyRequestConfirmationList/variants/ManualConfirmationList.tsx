import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/ManualFooter';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a manually entered expense, and is the dispatcher's residual case: it also serves pay, per diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense. Those
 * last two are why `isPerDiemRequest` and `isTimeRequest` are passed through rather than hardcoded — they still
 * decide whether the amount, merchant and tax fields are shown.
 *
 * A manual expense is never a distance or scan request and never enters the compact layout, so this mounts no
 * distance controller.
 */
function ManualConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {selectedParticipants, isEditingSplitBill, isPerDiemRequest, isTimeRequest, isParticipantPickerVisible = false, onToggleBillable, onToggleReimbursable, receiptOptions} = props;

    const data = useConfirmationListData(props);

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            onTaxAmountEmptyChange={data.setIsTaxAmountEmpty}
        >
            <View>
                <ManualFooter
                    policy={data.policy}
                    policyTags={data.policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={data.amountDisplay}
                    requiredFlags={data.requiredFlags}
                    visibilityFlags={{...data.visibilityFlags, isParticipantPickerVisible}}
                    errorState={data.errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                    receiptOptions={receiptOptions}
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <ConfirmationDataContext.Provider value={data}>
            <TaxController />
            <SplitBillController />
            <FieldAutoSelector />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </ConfirmationDataContext.Provider>
    );
}

export default ManualConfirmationList;
