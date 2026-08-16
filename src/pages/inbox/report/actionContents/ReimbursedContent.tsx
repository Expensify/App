import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getReimbursedMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';

type ReimbursedContentProps = {
    action: ReportAction;
    reportOwnerAccountID: number | undefined;
};

function ReimbursedContent({action, reportOwnerAccountID}: ReimbursedContentProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(reportOwnerAccountID)});
    const [actorLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(action.actorAccountID)});
    const message = getReimbursedMessage(translate, dateFnsLocale, action, reportOwnerAccountID, submitterLogin, actorLogin, convertToDisplayString, currentUserAccountID);

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReimbursedContent;
