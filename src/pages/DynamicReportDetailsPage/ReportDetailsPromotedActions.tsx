import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useThemeStyles from '@hooks/useThemeStyles';

import {canJoinChat} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type ReportDetailsPromotedActionsProps = {
    reportID: string;
};

function ReportDetailsPromotedActions({reportID}: ReportDetailsPromotedActionsProps) {
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const parentReportAction = useParentReportAction(report);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;

    if (!report?.reportID) {
        return null;
    }

    const canJoin = canJoinChat(report, parentReportAction, policy, parentReport, !!reportNameValuePairs?.private_isArchived);

    const promotedActions = (() => {
        const result: PromotedAction[] = [];

        if (canJoin) {
            result.push(PromotedActions.join(report, currentUserAccountID));
        }

        result.push(PromotedActions.pin(report));

        result.push(PromotedActions.share());

        return result;
    })();

    return (
        <PromotedActionsBar
            containerStyle={styles.mt5}
            promotedActions={promotedActions}
        />
    );
}

export default ReportDetailsPromotedActions;
