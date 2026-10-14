import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import {getReimbursedMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type {ReportAction} from '@src/types/onyx';

import {loginSelector} from '@selectors/PersonalDetails';
import React from 'react';

type ReimbursedContentProps = {
    action: ReportAction;
    reportOwnerAccountID: number | undefined;
};

function ReimbursedContent({action, reportOwnerAccountID}: ReimbursedContentProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [submitterLogin] = usePersonalDetail(reportOwnerAccountID, loginSelector);
    const [actorLogin] = usePersonalDetail(action.actorAccountID, loginSelector);
    const message = getReimbursedMessage(translate, dateFnsLocale, action, reportOwnerAccountID, submitterLogin, actorLogin, convertToDisplayString, currentUserAccountID);

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReimbursedContent;
