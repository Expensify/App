/** Keeps survey eligibility consistent between unread selection and rendered rows. */
import {isResolvedSupportTicket, isSupportTicket} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type FilterHiddenSupportTicketSurveysParams = {
    reportActions: ReportAction[];
    sortedAllReportActions: ReportAction[] | undefined;
    report: OnyxEntry<Report>;
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;
};

function filterHiddenSupportTicketSurveys({reportActions, sortedAllReportActions, report, reportNameValuePairs}: FilterHiddenSupportTicketSurveysParams): ReportAction[] {
    if (!isSupportTicket(report)) {
        return reportActions;
    }

    const shouldHideAllSurveys = !isResolvedSupportTicket(report) || !!reportNameValuePairs?.reopenedAsReportID;
    const latestResolution = shouldHideAllSurveys ? undefined : sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
    const latestSurvey = latestResolution
        ? sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolution.created)
        : undefined;
    const shouldHideSurvey = (action: ReportAction) =>
        action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && (shouldHideAllSurveys || action.reportActionID !== latestSurvey?.reportActionID);

    return reportActions.some(shouldHideSurvey) ? reportActions.filter((action) => !shouldHideSurvey(action)) : reportActions;
}

export default filterHiddenSupportTicketSurveys;
