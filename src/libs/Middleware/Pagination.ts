// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import fastMerge from 'expensify-common/lib/fastMerge';
import Onyx from 'react-native-onyx';
import OnyxCache from 'react-native-onyx/dist/OnyxCache';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportActionsPages, Request, Response} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

function isPaginatedRequest<TResource>(request: Request | PaginatedRequest<TResource>): request is PaginatedRequest<TResource> {
    return 'isPaginated' in request && request.isPaginated;
}

function getReportActions(response: Response, reportID: string) {
    return response?.onyxData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)?.value as ReportActions | undefined;
}

const Pagination: Middleware = (requestResponse, request) => {
    if (!isPaginatedRequest(request)) {
        return requestResponse;
    }

    const {pageKey, getItemsFromResponse, sortItems, getItemID, isInitialRequest} = request;
    return requestResponse.then((response) => {
        if (!response?.onyxData) {
            return Promise.resolve(response);
        }

        // Create a new page based on the response
        const items = getItemsFromResponse(response);
        const sortedItems = sortItems(items);
        if (sortedItems.length === 0) {
            // Must have at least 1 action to create a page.
            Log.hmmm(`[Pagination] Did not receive any items in the response to ${request.command}`);
            return Promise.resolve(response);
        }

        const sortedItemIDs = sortedItems.map((item) => getItemID(item));
        if (isInitialRequest) {
            sortedItemIDs.unshift(CONST.PAGINATION_START_ID);
        }

        // TODO: Provide key for the resource in the paginatedRequest. Also, we can probably derive the "pages" key from that resource.
        const existingItems = OnyxCache.getValue(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
        const allItems = fastMerge(existingItems, items, true);
        const sortedAllItems = sortItems(allItems);

        const existingPages = OnyxCache.getValue(pageKey);
        // TODO: generalize this function
        const mergedPages = ReportActionsUtils.mergeContinuousPages();

        response.onyxData.push({
            key: pageKey,
            onyxMethod: Onyx.METHOD.SET,
            value: mergedPages,
        });

        return Promise.resolve(response);
    });

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
