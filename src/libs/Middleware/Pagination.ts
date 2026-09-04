import type {ApiCommand} from '@libs/API/types';
import Log from '@libs/Log';
import {mergeAndSortContinuousPages, mergePagesByIDOverlap} from '@libs/PaginationUtils';

import CONST from '@src/CONST';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import type Pages from '@src/types/onyx/Pages';
import type {AnyOnyxUpdate, PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxCollection, OnyxKey} from 'react-native-onyx';

import {fastMerge} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type Middleware from './types';

type PagedResource<TResourceKey extends OnyxCollectionKey> = OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never;

// Simplified type for paginated resource collections to avoid complex union type errors
type PaginatedResourceCollection = Record<string, unknown>;

type PaginationCommonConfig<TResourceKey extends OnyxCollectionKey = OnyxCollectionKey, TPageKey extends OnyxPagesKey = OnyxPagesKey> = {
    resourceCollectionKey: TResourceKey;
    pageCollectionKey: TPageKey;
    sortItems: (items: OnyxValues[TResourceKey], reportID: string) => Array<PagedResource<TResourceKey>>;
    getItemID: (item: PagedResource<TResourceKey>) => string;
};

type PaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey> = PaginationCommonConfig<TResourceKey, TPageKey> & {
    initialCommand: ApiCommand;
    previousCommand: ApiCommand;
    nextCommand: ApiCommand;
    additionalReadyPromise?: Promise<void>;
};

type PaginationConfigMapValue = PaginationCommonConfig & {
    type: 'initial' | 'next' | 'previous';
    readyPromise: Promise<void>;
};

// Map of API commands to their pagination configs
const paginationConfigs = new Map<string, PaginationConfigMapValue>();

// Local cache of paginated Onyx resources
const resources = new Map<OnyxCollectionKey, OnyxCollection<OnyxValues[OnyxCollectionKey]>>();

// Local cache of Onyx pages objects
const pages = new Map<OnyxPagesKey, OnyxCollection<OnyxValues[OnyxPagesKey]>>();

function registerPaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey>({
    initialCommand,
    previousCommand,
    nextCommand,
    additionalReadyPromise = Promise.resolve(),
    ...config
}: PaginationConfig<TResourceKey, TPageKey>): Promise<void> {
    const resourceSnapshot = Promise.withResolvers<void>();
    const pageSnapshot = Promise.withResolvers<void>();
    const readyPromise = Promise.all([resourceSnapshot.promise, pageSnapshot.promise, additionalReadyPromise]).then(() => undefined);

    paginationConfigs.set(initialCommand, {
        ...config,
        readyPromise,
        type: 'initial',
    } as unknown as PaginationConfigMapValue);
    paginationConfigs.set(previousCommand, {
        ...config,
        readyPromise,
        type: 'previous',
    } as unknown as PaginationConfigMapValue);
    paginationConfigs.set(nextCommand, {
        ...config,
        readyPromise,
        type: 'next',
    } as unknown as PaginationConfigMapValue);
    Onyx.connectWithoutView<OnyxCollectionKey>({
        key: config.resourceCollectionKey,
        callback: (data) => {
            resources.set(config.resourceCollectionKey, data);
            resourceSnapshot.resolve();
        },
    });
    Onyx.connectWithoutView<OnyxPagesKey>({
        key: config.pageCollectionKey,
        callback: (data) => {
            pages.set(config.pageCollectionKey, data);
            pageSnapshot.resolve();
        },
    });

    return readyPromise;
}

function isPaginatedRequest<TKey extends OnyxKey>(request: Request<TKey> | PaginatedRequest<TKey>): request is PaginatedRequest<TKey> {
    return 'isPaginated' in request && request.isPaginated;
}

function processResponse<TKey extends OnyxKey>(requestResponse: Promise<Response<TKey> | void>, request: PaginatedRequest<TKey>, paginationConfig: PaginationConfigMapValue) {
    const {resourceCollectionKey, pageCollectionKey, sortItems, getItemID, type} = paginationConfig;
    const {resourceID, cursorID} = request;
    return Promise.all([requestResponse, paginationConfig.readyPromise]).then(([response]) => {
        if (!response?.onyxData) {
            return Promise.resolve(response);
        }

        const resourceKey = `${resourceCollectionKey}${resourceID}` as const;
        const pageKey = `${pageCollectionKey}${resourceID}` as const;

        // Create a new page based on the response
        const pageData = response.onyxData.find((data) => data.key === resourceKey) as {value?: PaginatedResourceCollection} | undefined;
        const pageItems: PaginatedResourceCollection = pageData?.value ?? {};
        const sortedPageItems = sortItems(pageItems, resourceID);
        if (sortedPageItems.length === 0) {
            // Must have at least 1 action to create a page.
            Log.hmmm(`[Pagination] Did not receive any items in the response to ${request.command}`);
            return Promise.resolve(response);
        }

        const newPage = sortedPageItems.map((item) => getItemID(item));

        const shouldMarkNoNewerActions = response.hasNewerActions === false || response.hasNewerActions === null || (type === 'initial' && !cursorID && response.hasNewerActions !== true);
        if (shouldMarkNoNewerActions) {
            newPage.unshift(CONST.PAGINATION_START_ID);
        }
        if (response.hasOlderActions === false || response.hasOlderActions === null) {
            newPage.push(CONST.PAGINATION_END_ID);
        }

        const resourceCollections = resources.get(resourceCollectionKey) ?? {};
        const existingItems = (resourceCollections[resourceKey] ?? {}) as PaginatedResourceCollection;
        const allItems = fastMerge(existingItems, pageItems, true);
        const sortedAllItems = sortItems(allItems, resourceID);

        const pagesCollections = pages.get(pageCollectionKey) ?? {};
        const existingPages: Pages = pagesCollections[pageKey] ?? [];

        const isMiddleInitialSlice = type === 'initial' && !cursorID && response.hasNewerActions === true && response.hasOlderActions === true;

        // Only strip PAGINATION_START_ID from cached pages when the server explicitly confirms newer actions exist.
        // Some commands (e.g. GetOlderActions) don't return hasNewerActions at all — in that case, preserve the existing boundary.
        const shouldStripStartMarker = response.hasNewerActions === true;
        const sanitizedExistingPages = shouldStripStartMarker ? existingPages.map((page) => page.filter((id) => id !== CONST.PAGINATION_START_ID)) : existingPages;

        const mergedPages: Pages = isMiddleInitialSlice
            ? mergePagesByIDOverlap(sortedAllItems, [...sanitizedExistingPages, newPage], getItemID)
            : mergeAndSortContinuousPages(sortedAllItems, [...sanitizedExistingPages, newPage], getItemID);

        (response.onyxData as AnyOnyxUpdate[]).push({
            key: pageKey,
            onyxMethod: Onyx.METHOD.SET,
            value: mergedPages,
        });

        // Store cursor IDs scoped to pagination direction so backfill (getOlderActions)
        // doesn't overwrite the forward cursor used by auto-pagination.
        if (resourceCollectionKey === ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
            const newestFetchedID = newPage.find((id) => id !== CONST.PAGINATION_START_ID && id !== CONST.PAGINATION_END_ID);
            const oldestFetchedID = newPage.findLast((id) => id !== CONST.PAGINATION_START_ID && id !== CONST.PAGINATION_END_ID);
            const isOlderDirection = type === 'previous';
            const value: Record<string, string> = {};
            if (newestFetchedID && !isOlderDirection) {
                value.newestFetchedReportActionID = newestFetchedID;
            }
            if (oldestFetchedID && isOlderDirection) {
                value.oldestFetchedReportActionID = oldestFetchedID;
            }
            if (Object.keys(value).length > 0) {
                (response.onyxData as AnyOnyxUpdate[]).push({
                    key: `${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${resourceID}`,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value,
                });
            }
        }

        return Promise.resolve(response);
    });
}

/**
 * This middleware handles paginated requests marked with isPaginated: true. It works by:
 *
 * 1. Extracting the paginated resources from the response
 * 2. Sorting them
 * 3. Merging the new page of resources with any preexisting pages it overlaps with
 * 4. Updating the saved pages in Onyx for that resource.
 *
 * It does this to keep track of what it's fetched via pagination and what may have showed up from other sources,
 * so it can keep track of and fill any potential gaps in paginated lists.
 */
const Pagination: Middleware = (requestResponse, request) => {
    if (!isPaginatedRequest(request)) {
        return requestResponse;
    }

    const paginationConfig = paginationConfigs.get(request.command);
    if (!paginationConfig) {
        return requestResponse;
    }

    return processResponse(requestResponse, request, paginationConfig);
};

export {Pagination, registerPaginationConfig};
