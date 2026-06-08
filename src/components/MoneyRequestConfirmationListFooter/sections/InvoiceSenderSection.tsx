import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type InvoiceSenderSectionProps = {
    /** Selected participants (used to derive the sender workspace) */
    selectedParticipants: Participant[];

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function InvoiceSenderSection({selectedParticipants, transaction}: InvoiceSenderSectionProps) {
    const {iouType, reportID, isReadOnly, didConfirm} = useConfirmationFields();
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
