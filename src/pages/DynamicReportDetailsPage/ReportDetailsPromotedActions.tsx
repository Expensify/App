import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {canJoinChat} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ReportDetailsPromotedActionsProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
};

function ReportDetailsPromotedActions({report, policy, parentReport, parentReportAction}: ReportDetailsPromotedActionsProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);

    const canJoin = canJoinChat(report, parentReportAction, policy, parentReport, !!reportNameValuePairs?.private_isArchived);

    const promotedActions: PromotedAction[] = [];
    if (canJoin) {
        promotedActions.push(PromotedActions.join(report, currentUserPersonalDetails.accountID));
    }
    if (report) {
        promotedActions.push(PromotedActions.pin(report));
    }
    promotedActions.push(PromotedActions.share());

    return (
        <PromotedActionsBar
            containerStyle={styles.mt5}
            promotedActions={promotedActions}
        />
    );
}

export default ReportDetailsPromotedActions;
