import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type InvoiceSenderSectionProps = {
    /** Type of IOU being confirmed (this section only renders when iouType === INVOICE) */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** Selected participants (used to derive the sender workspace) */
    selectedParticipants: Participant[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function InvoiceSenderSection({iouType, reportID, selectedParticipants, isReadOnly, didConfirm, transaction}: InvoiceSenderSectionProps) {
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
