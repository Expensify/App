// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import fastMerge from 'expensify-common/lib/fastMerge';
import Onyx from 'react-native-onyx';
import OnyxCache from 'react-native-onyx/dist/OnyxCache';
import Log from '@libs/Log';
import PaginationUtils from '@libs/PaginationUtils';
import CONST from '@src/CONST';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Pages, ReportActions, Request, Response} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

function isPaginatedRequest<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey>(
    request: Request | PaginatedRequest<TResourceKey, TPageKey>,
): request is PaginatedRequest<TResourceKey, TPageKey> {
    return 'isPaginated' in request && request.isPaginated;
}

function getReportActions(response: Response, reportID: string) {
    return response?.onyxData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)?.value as ReportActions | undefined;
}

const Pagination: Middleware = (requestResponse, request) => {
    if (!isPaginatedRequest(request)) {
        return requestResponse;
    }

    const {resourceKey, pageKey, getItemsFromResponse, sortItems, getItemID, isInitialRequest} = request;
    return requestResponse.then((response) => {
        if (!response?.onyxData) {
            return Promise.resolve(response);
        }

        // Create a new page based on the response
        const pageItems = getItemsFromResponse(response);
        const sortedPageItems = sortItems(pageItems);
        if (sortedPageItems.length === 0) {
            // Must have at least 1 action to create a page.
            Log.hmmm(`[Pagination] Did not receive any items in the response to ${request.command}`);
            return Promise.resolve(response);
        }

        const newPage = sortedPageItems.map((item) => getItemID(item));
        if (isInitialRequest) {
            newPage.unshift(CONST.PAGINATION_START_ID);
        }

        // TODO: Provide key for the resource in the paginatedRequest. Also, we can probably derive the "pages" key from that resource.
        const existingItems = OnyxCache.getValue(resourceKey) as OnyxValues[typeof resourceKey];
        const allItems = fastMerge(existingItems, pageItems, true);
        const sortedAllItems = sortItems(allItems);

        const existingPages = OnyxCache.getValue(pageKey) as Pages;
        // TODO: generalize this function
        const mergedPages = PaginationUtils.mergeContinuousPages(sortedAllItems, [...existingPages, newPage], getItemID);

        response.onyxData.push({
            key: pageKey,
            onyxMethod: Onyx.METHOD.SET,
            value: mergedPages,
        });

        return Promise.resolve(response);
    });
};

export default Pagination;
