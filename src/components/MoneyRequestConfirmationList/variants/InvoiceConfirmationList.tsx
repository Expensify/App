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
    const data = useConfirmationListData({...props, iouType: CONST.IOU.TYPE.INVOICE});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isTypeInvoice
        >
            <View>
                <InvoiceFooter {...data.footerProps} />
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
