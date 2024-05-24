// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import OnyxCache from 'react-native-onyx/dist/OnyxCache';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportActionsPages, Response} from '@src/types/onyx';
import type Middleware from './types';

function getReportActions(response: Response, reportID: string) {
    return response?.onyxData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)?.value as ReportActions | undefined;
}

const Pagination: Middleware = (requestResponse, request) => {
    if (request.command === WRITE_COMMANDS.OPEN_REPORT || request.command === READ_COMMANDS.GET_OLDER_ACTIONS || request.command === READ_COMMANDS.GET_NEWER_ACTIONS) {
        return requestResponse.then((response) => {
            if (!response?.onyxData) {
                return Promise.resolve(response);
            }

            const reportID = request.data?.reportID as string | undefined;
            if (!reportID) {
                // TODO: Should not happen, should we throw?
                return Promise.resolve(response);
            }

            const reportActionID = request.data?.reportActionID as string | undefined;

            // Create a new page based on the response actions.
            const pageReportActions = getReportActions(response, reportID);
            const pageSortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(pageReportActions, true);
            if (pageSortedReportActions.length === 0) {
                // Must have at least 1 action to create a page.
                return Promise.resolve(response);
            }
            const newPage = pageSortedReportActions.map((action) => action.reportActionID);
            if (reportActionID == null) {
                newPage.unshift(CONST.PAGINATION_START_ID);
            }

            const reportActions = OnyxCache.getValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`) as ReportActions | undefined;
            // TODO: Do we need to do proper merge here or this is ok?
            const allReportActions = {...reportActions, ...pageReportActions};
            const allSortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true);

            const pages = (OnyxCache.getValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`) ?? []) as ReportActionsPages;
            const newPages = ReportActionsUtils.mergeContinuousPages(allSortedReportActions, [...pages, newPage]);

            response.onyxData.push({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`,
                onyxMethod: 'merge',
                value: newPages,
            });

            return Promise.resolve(response);
        });
    }

    return requestResponse;
};

export default Pagination;
