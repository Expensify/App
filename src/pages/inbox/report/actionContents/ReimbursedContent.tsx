import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getReimbursedMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {ReportAction} from '@src/types/onyx';

type ReimbursedContentProps = {
    action: ReportAction;
    reportOwnerAccountID: number | undefined;
};

function ReimbursedContent({action, reportOwnerAccountID}: ReimbursedContentProps) {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(reportOwnerAccountID)});
    const [actorLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(action.actorAccountID)});
    const message = getReimbursedMessage(translate, action, reportOwnerAccountID, submitterLogin, actorLogin, currentUserAccountID);

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReimbursedContent;
