import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Response} from '@src/types/onyx';
import type Middleware from './types';

// eslint-disable-next-line rulesdir/no-inline-named-export
export function setPreviousReportActionID(reportActions: ReportActions, sortedReportActions: ReportAction[], insertGap: boolean): void {
    for (let i = 0; i < sortedReportActions.length; i++) {
        const previousReportActionID = sortedReportActions[i + 1]?.reportActionID;
        // eslint-disable-next-line no-param-reassign
        reportActions[sortedReportActions[i].reportActionID].previousReportActionID = previousReportActionID ?? (insertGap ? CONST.PAGINATION_GAP_ID : undefined);
    }
}

function getReportActions(response: Response | void, reportID: string) {
    return response?.onyxData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)?.value as ReportActions | undefined;
}

const Pagination: Middleware = (requestResponse, request) => {
    if (request.command === WRITE_COMMANDS.OPEN_REPORT || request.command === READ_COMMANDS.GET_OLDER_ACTIONS || request.command === READ_COMMANDS.GET_NEWER_ACTIONS) {
        return requestResponse.then((response = {}) => {
            const reportID = request.data?.reportID as string | undefined;
            if (!reportID) {
                return Promise.resolve(response);
            }

            const reportActions = getReportActions(response, reportID);
            if (!reportActions) {
                return Promise.resolve(response);
            }

            const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(reportActions, true);

            setPreviousReportActionID(
                reportActions,
                sortedReportActions,
                // For GetNewerActions we do not want to insert a gap since we attach
                // at the start of the list.
                request.command !== READ_COMMANDS.GET_NEWER_ACTIONS,
            );

            return Promise.resolve(response);
        });
    }

    return requestResponse;
};

export default Pagination;
