import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

function getUISelectedParticipants(participants: Participant[] | typeof CONST.EMPTY_ARRAY | undefined, iouType: IOUType, invoiceReceiver?: InvoiceReceiver): Participant[] {
    const selectedParticipants = (participants ?? CONST.EMPTY_ARRAY).filter((participant) => participant.selected !== false && !participant.isSender);

    if (selectedParticipants.length > 0 || iouType !== CONST.IOU.TYPE.INVOICE || !invoiceReceiver) {
        return selectedParticipants;
    }

    if (invoiceReceiver.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return [
            {
                accountID: invoiceReceiver.accountID,
                selected: true,
                iouType,
            },
        ];
    }

    return [
        {
            policyID: invoiceReceiver.policyID,
            selected: true,
            iouType,
        },
    ];
}

export default getUISelectedParticipants;
