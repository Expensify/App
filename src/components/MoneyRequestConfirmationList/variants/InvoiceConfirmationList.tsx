import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import InvoiceFooter from '@components/MoneyRequestConfirmationListFooter/variants/InvoiceFooter';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/** Confirms an invoice */
function InvoiceConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {selectedParticipants, isParticipantPickerVisible = false, onToggleBillable, onToggleReimbursable, receiptOptions} = props;

    const data = useConfirmationListData({...props, iouType: CONST.IOU.TYPE.INVOICE});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isTypeInvoice
            onTaxAmountEmptyChange={data.setIsTaxAmountEmpty}
        >
            <View>
                <InvoiceFooter
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
        <>
            <TaxController {...data.taxControllerProps} />
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </>
    );
}

export default InvoiceConfirmationList;
