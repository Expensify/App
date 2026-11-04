/** Bills and their invoices name the vendor and receiver rather than describing an expense report submission. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {displayNameOrDefaultSelector} from '@src/selectors/PersonalDetails';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type BillPaySubmittedContentProps = {
    reportID: string | undefined;
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

function BillPaySubmittedContent({reportID}: BillPaySubmittedContentProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const [participants] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: billPayParticipantsSelector});
    const [sender = ''] = usePersonalDetail(participants?.senderAccountID, displayNameOrDefaultSelector(translate, formatPhoneNumber));
    const [receiver = ''] = usePersonalDetail(participants?.receiverAccountID, displayNameOrDefaultSelector(translate, formatPhoneNumber));
    const message = participants?.isInvoice ? translate('billPay.invoiceSubmitted', {sender, receiver}) : translate('billPay.billSubmitted', {sender, receiver});

    return <ReportActionItemBasicMessage message={message} />;
}

export default BillPaySubmittedContent;
