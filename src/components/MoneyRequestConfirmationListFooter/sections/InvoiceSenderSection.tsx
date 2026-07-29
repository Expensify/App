import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import {invoiceSenderSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';

import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

import React from 'react';

type InvoiceSenderSectionProps = {
    /** Selected participants (used to derive the sender workspace) */
    selectedParticipants: Participant[];
};

/**
 * Two-level guard: the outer component reads only the cheap `iouType` scalar from context and
 * short-circuits on every non-invoice flow. The inner component is the only place that subscribes
 * to the transaction slice, so non-invoice flows avoid the extra Onyx subscriptions.
 */
function InvoiceSenderSection({selectedParticipants}: InvoiceSenderSectionProps) {
    const {iouType} = useConfirmationFields();
    if (iouType !== CONST.IOU.TYPE.INVOICE) {
        return null;
    }
    return <InvoiceSenderSectionContent selectedParticipants={selectedParticipants} />;
}

function InvoiceSenderSectionContent({selectedParticipants}: InvoiceSenderSectionProps) {
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
