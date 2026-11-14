/** Bills and their invoices name the vendor and receiver rather than describing an expense report submission. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getBillPayHistoryParticipantSelector} from '@src/selectors/ReportAction';
import type {PersonalDetails, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type BillPayHistoryContentProps = {
    reportID: string | undefined;
    reportActionID: string;
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

function BillPayHistoryContent({reportID, reportActionID}: BillPayHistoryContentProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const [participants] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: billPayParticipantsSelector});
    const [historyParticipant] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {
        selector: (reportActions) => getBillPayHistoryParticipantSelector(reportActions, reportActionID),
    });
    const isCreatedAction = historyParticipant?.isCreatedAction;

    // The API can omit names and logins from personal details for the other company. The submission already includes both emails.
    const participantNameSelector = (personalDetails: PersonalDetails | undefined) =>
        temporaryGetDisplayNameOrDefault({
            passedPersonalDetails: personalDetails,
            defaultValue: formatPhoneNumber((isCreatedAction ? historyParticipant?.senderLogin : historyParticipant?.receiverLogin) ?? ''),
            translate,
            formatPhoneNumber,
        });
    const [participant = ''] = usePersonalDetail(
        isCreatedAction ? participants?.senderAccountID : (historyParticipant?.receiverAccountID ?? participants?.receiverAccountID),
        participantNameSelector,
    );

    if (isCreatedAction) {
        const message = participants?.isInvoice ? translate('billPay.invoiceCreated', {sender: participant}) : translate('billPay.billCreated', {sender: participant});
        return <ReportActionItemBasicMessage message={message} />;
    }

    const message = participants?.isInvoice ? translate('billPay.invoiceSubmitted', {receiver: participant}) : translate('billPay.billSubmitted', {receiver: participant});

    return <ReportActionItemBasicMessage message={message} />;
}

export default BillPayHistoryContent;
