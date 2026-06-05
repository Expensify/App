import React from 'react';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import {invoiceSenderSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

type InvoiceSenderSectionProps = {
    /** Selected participants (used to derive the sender workspace) */
    selectedParticipants: Participant[];
};

function InvoiceSenderSection({selectedParticipants}: InvoiceSenderSectionProps) {
    const {iouType, reportID, transactionID, isReadOnly, didConfirm} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, invoiceSenderSliceSelector);
    if (iouType !== CONST.IOU.TYPE.INVOICE) {
        return null;
    }
    return (
        <InvoiceSenderField
            selectedParticipants={selectedParticipants}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            iouType={iouType}
            reportID={reportID}
            transaction={transaction}
        />
    );
}

export default InvoiceSenderSection;
