import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import InvoiceFooter from '@components/MoneyRequestConfirmationListFooter/variants/InvoiceFooter';

import CONST from '@src/CONST';

import React from 'react';

/** Confirms an invoice */
function InvoiceConfirmationList(props: MoneyRequestConfirmationListProps) {
    const data = useConfirmationListData({...props, iouType: CONST.IOU.TYPE.INVOICE});

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isTypeInvoice: true}}
            listFooterContent={<InvoiceFooter {...data.footerProps} />}
        >
            <TaxController {...data.taxControllerProps} />
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default InvoiceConfirmationList;
