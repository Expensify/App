import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {getReimbursedMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type {Report, ReportAction} from '@src/types/onyx';

type ReimbursedContentProps = {
    action: ReportAction;
    report: OnyxEntry<Report>;
};

function ReimbursedContent({action, report}: ReimbursedContentProps) {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const message = getReimbursedMessage(translate, action, report, currentUserAccountID);

    return <ReportActionItemBasicMessage message={message} />;
}

ReimbursedContent.displayName = 'ReimbursedContent';

export default ReimbursedContent;
