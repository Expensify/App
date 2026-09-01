import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import {invoiceSenderSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';

import type {Participant} from '@src/types/onyx/IOU';

import React from 'react';

type InvoiceSenderSectionProps = {
    /** Selected participants (used to derive the sender workspace) */
    selectedParticipants: Participant[];
};

/** Only `InvoiceFooter` renders this, so the `iouType === INVOICE` check the section used to make is redundant. */
function InvoiceSenderSection({selectedParticipants}: InvoiceSenderSectionProps) {
    const {transactionID, isReadOnly, didConfirm} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, invoiceSenderSliceSelector);
    return (
        <InvoiceSenderField
            selectedParticipants={selectedParticipants}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            transaction={transaction}
        />
    );
}

export default InvoiceSenderSection;
