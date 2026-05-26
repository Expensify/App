import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {getReimbursedMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type {ReportAction} from '@src/types/onyx';

type ReimbursedContentProps = {
    action: ReportAction;
    reportOwnerAccountID: number | undefined;
};

function ReimbursedContent({action, reportOwnerAccountID}: ReimbursedContentProps) {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const message = getReimbursedMessage(translate, action, reportOwnerAccountID, currentUserAccountID);

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReimbursedContent;
