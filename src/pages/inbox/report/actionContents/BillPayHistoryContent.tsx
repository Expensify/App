/** Bills and their invoices name the vendor and receiver rather than describing an expense report submission. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {displayNameOrDefaultSelector} from '@src/selectors/PersonalDetails';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type BillPayHistoryContentProps = {
    reportID: string | undefined;
    actionName: ReportAction['actionName'];
};

// The vendor owns the invoice, and bill intake submits it to the receiver. The receiver owns the bill, and Auth sends the
// invoice's owner as the bill's sender.
const billPayParticipantsSelector = (report: OnyxEntry<Report>) => {
    const isInvoice = report?.type === CONST.REPORT.TYPE.INVOICE;
    return {
        isInvoice,
        senderAccountID: isInvoice ? report?.ownerAccountID : report?.billSenderAccountID,
        receiverAccountID: isInvoice ? report?.managerID : report?.ownerAccountID,
    };
};

function BillPayHistoryContent({reportID, actionName}: BillPayHistoryContentProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const [participants] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: billPayParticipantsSelector});
    const isCreatedAction = actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
    const [participant = ''] = usePersonalDetail(
        isCreatedAction ? participants?.senderAccountID : participants?.receiverAccountID,
        displayNameOrDefaultSelector(translate, formatPhoneNumber),
    );

    if (isCreatedAction) {
        const message = participants?.isInvoice ? translate('billPay.invoiceCreated', {sender: participant}) : translate('billPay.billCreated', {sender: participant});
        return <ReportActionItemBasicMessage message={message} />;
    }

    const message = participants?.isInvoice ? translate('billPay.invoiceSubmitted', {receiver: participant}) : translate('billPay.billSubmitted', {receiver: participant});

    return <ReportActionItemBasicMessage message={message} />;
}

export default BillPayHistoryContent;
