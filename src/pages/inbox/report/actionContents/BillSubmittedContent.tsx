/** Bills name the vendor and receiver rather than describing an expense report submission. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import ONYXKEYS from '@src/ONYXKEYS';
import {displayNameOrDefaultSelector} from '@src/selectors/PersonalDetails';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type BillSubmittedContentProps = {
    reportID: string | undefined;
};

const billParticipantsSelector = (report: OnyxEntry<Report>) => ({senderAccountID: report?.billSenderAccountID, receiverAccountID: report?.ownerAccountID});

function BillSubmittedContent({reportID}: BillSubmittedContentProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const [participants] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: billParticipantsSelector});
    const [sender = ''] = usePersonalDetail(participants?.senderAccountID, displayNameOrDefaultSelector(translate, formatPhoneNumber));
    const [receiver = ''] = usePersonalDetail(participants?.receiverAccountID, displayNameOrDefaultSelector(translate, formatPhoneNumber));

    return <ReportActionItemBasicMessage message={translate('billPay.submitted', {sender, receiver})} />;
}

export default BillSubmittedContent;
