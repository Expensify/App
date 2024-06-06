// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import fastMerge from 'expensify-common/dist/fastMerge';
import Onyx from 'react-native-onyx';
import OnyxCache from 'react-native-onyx/dist/OnyxCache';
import Log from '@libs/Log';
import PaginationUtils from '@libs/PaginationUtils';
import CONST from '@src/CONST';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
import type {Pages, Request} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

function isPaginatedRequest<TResource, TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey>(
    request: Request | PaginatedRequest<TResource, TResourceKey, TPageKey>,
): request is PaginatedRequest<TResource, TResourceKey, TPageKey> {
    return 'isPaginated' in request && request.isPaginated;
}

/**
 * This middleware handles paginated requests marked with isPaginated: true. It works by:
 *
 * 1. Extracting the paginated resources from the response
 * 2. Sorting them
 * 3. Merging the new page of resources with any preexisting pages it overlaps with
 * 4. Updating the saves pages in Onyx for that resource.
 *
 * It does this to keep track of what it's fetched via pagination and what may have showed up from other sources,
 * so it can keep track of and fill any potential gaps in paginated lists.
 */
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

        const existingItems = (OnyxCache.getValue(resourceKey) ?? {}) as OnyxValues[typeof resourceKey];
        const allItems = fastMerge(existingItems, pageItems, true);
        const sortedAllItems = sortItems(allItems);

        const existingPages = (OnyxCache.getValue(pageKey) ?? []) as Pages;
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
