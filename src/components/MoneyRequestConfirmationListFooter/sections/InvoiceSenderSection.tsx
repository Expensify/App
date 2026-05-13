import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import InvoiceSenderField from '@components/MoneyRequestConfirmationList/sections/InvoiceSenderField';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type InvoiceSenderSectionProps = {
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    selectedParticipants: Participant[];
    isReadOnly: boolean;
    didConfirm: boolean;
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
