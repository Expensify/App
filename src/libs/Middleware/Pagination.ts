// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import OnyxCache from 'react-native-onyx/dist/OnyxCache';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportMetadata, Response} from '@src/types/onyx';
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
            const newPage = {
                // Use null to indicate this is the first page.
                firstReportActionID: reportActionID == null ? null : pageSortedReportActions.at(0)?.reportActionID ?? null,
                // TODO: It would be nice to have a way to know if this is the last page.
                lastReportActionID: pageSortedReportActions.at(-1)?.reportActionID ?? null,
            };

            const reportActions = OnyxCache.getValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`) as ReportActions | undefined;
            // TODO: Do we need to do proper merge here or this is ok?
            const allReportActions = {...reportActions, ...pageReportActions};
            const allSortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true);

            const reportMetadata = OnyxCache.getValue(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`) as ReportMetadata | undefined;
            const pages = reportMetadata?.pages ?? [];
            const newPages = ReportActionsUtils.mergeContinuousPages(allSortedReportActions, [...pages, newPage]);

            response.onyxData.push({
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                onyxMethod: 'merge',
                value: {
                    pages: newPages,
                },
            });

            return Promise.resolve(response);
        });
    }

    return requestResponse;
};

export default Pagination;
