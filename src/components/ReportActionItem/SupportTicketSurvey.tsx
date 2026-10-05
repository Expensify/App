import RenderHTML from '@components/RenderHTML';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getReportActionHtml} from '@libs/ReportActionsUtils';

import ConciergeFeedbackPrompt from '@pages/inbox/report/actionContents/ConciergeFeedbackPrompt';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type SupportTicketSurveyProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY>;
    report: OnyxEntry<Report>;
    reportID: string | undefined;
};

function getLatestSurveyAfterResolution(reportActions: OnyxEntry<ReportActions>): ReportAction | undefined {
    const actions = Object.values(reportActions ?? {}).filter((reportAction): reportAction is ReportAction => !!reportAction);
    const latestResolvedAction = actions
        .filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED)
        .sort((firstAction, secondAction) => firstAction.created.localeCompare(secondAction.created))
        .at(-1);

    if (!latestResolvedAction) {
        return undefined;
    }

    return actions
        .filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && reportAction.created >= latestResolvedAction.created)
        .sort((firstAction, secondAction) => firstAction.created.localeCompare(secondAction.created))
        .at(-1);
}

function SupportTicketSurvey({action, report, reportID}: SupportTicketSurveyProps) {
    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const latestSurvey = useMemo(() => getLatestSurveyAfterResolution(reportActions), [reportActions]);
    const canRateSurvey = report?.ownerAccountID === currentUserAccountID;

    if (
        report?.stateNum !== CONST.REPORT.STATE_NUM.APPROVED ||
        report?.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED ||
        reportNameValuePairs?.reopenedAsReportID ||
        latestSurvey?.reportActionID !== action.reportActionID ||
        !reportID
    ) {
        return null;
    }

    return (
        <View style={styles.chatItemMessage}>
            <RenderHTML html={getReportActionHtml(action)} />
            {canRateSurvey && (
                <ConciergeFeedbackPrompt
                    action={action}
                    reportID={reportID}
                    shouldShowPrompt={false}
                    shouldPersistAfterRating
                />
            )}
        </View>
    );
}

export default SupportTicketSurvey;
export {getLatestSurveyAfterResolution};
