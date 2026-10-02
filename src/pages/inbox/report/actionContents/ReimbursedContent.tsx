import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReimbursedMessage, hasReasoning} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {loginSelector} from '@selectors/PersonalDetails';
import React from 'react';

type ReimbursedContentProps = {
    action: ReportAction;
    reportOwnerAccountID: number | undefined;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function ReimbursedContent({action, reportOwnerAccountID, originalReport}: ReimbursedContentProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [submitterLogin] = usePersonalDetail(reportOwnerAccountID, loginSelector);
    const [actorLogin] = usePersonalDetail(action.actorAccountID, loginSelector);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);
    const message = getReimbursedMessage(translate, dateFnsLocale, action, reportOwnerAccountID, submitterLogin, actorLogin, convertToDisplayString, currentUserAccountID);

    if (hasReasoning(action)) {
        return (
            <ReportActionItemMessageWithExplain
                message={message}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReimbursedContent;
