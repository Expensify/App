/** Keeps survey eligibility consistent between unread selection and rendered rows. */
import {isResolvedSupportTicket, isSupportTicket} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type FilterHiddenSupportTicketSurveysParams = {
    reportActions: ReportAction[];

    /** Every action of the report in the Onyx cache, newest first, which holds the latest resolution and survey even outside the loaded window. */
    cachedActions: ReportAction[] | undefined;
    report: OnyxEntry<Report>;

    /** Whether the ticket was reopened as a new report, which makes all of its surveys stale. */
    isReopenedSupportTicket: boolean;
};

function filterHiddenSupportTicketSurveys({reportActions, cachedActions, report, isReopenedSupportTicket}: FilterHiddenSupportTicketSurveysParams): ReportAction[] {
    if (!isSupportTicket(report)) {
        return reportActions;
    }

    const shouldHideAllSurveys = !isResolvedSupportTicket(report) || isReopenedSupportTicket;
    const latestResolution = shouldHideAllSurveys ? undefined : cachedActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
    const latestSurvey = latestResolution
        ? cachedActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolution.created)
        : undefined;
    const shouldHideSurvey = (action: ReportAction) =>
        action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && (shouldHideAllSurveys || action.reportActionID !== latestSurvey?.reportActionID);

    return reportActions.some(shouldHideSurvey) ? reportActions.filter((action) => !shouldHideSurvey(action)) : reportActions;
}

export default filterHiddenSupportTicketSurveys;
