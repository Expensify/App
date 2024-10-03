import fastMerge from 'expensify-common/dist/fastMerge';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ApiCommand} from '@libs/API/types';
import Log from '@libs/Log';
import PaginationUtils from '@libs/PaginationUtils';
import CONST from '@src/CONST';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

type PagedResource<TResourceKey extends OnyxCollectionKey> = OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never;

type PaginationCommonConfig<TResourceKey extends OnyxCollectionKey = OnyxCollectionKey, TPageKey extends OnyxPagesKey = OnyxPagesKey> = {
    resourceCollectionKey: TResourceKey;
    pageCollectionKey: TPageKey;
    sortItems: (items: OnyxValues[TResourceKey]) => Array<PagedResource<TResourceKey>>;
    getItemID: (item: PagedResource<TResourceKey>) => string;
};

type PaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey> = PaginationCommonConfig<TResourceKey, TPageKey> & {
    initialCommand: ApiCommand;
    previousCommand: ApiCommand;
    nextCommand: ApiCommand;
};

type PaginationConfigMapValue = PaginationCommonConfig & {
    type: 'initial' | 'next' | 'previous';
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
    ...config
}: PaginationConfig<TResourceKey, TPageKey>): void {
    paginationConfigs.set(initialCommand, {...config, type: 'initial'} as unknown as PaginationConfigMapValue);
    paginationConfigs.set(previousCommand, {...config, type: 'previous'} as unknown as PaginationConfigMapValue);
    paginationConfigs.set(nextCommand, {...config, type: 'next'} as unknown as PaginationConfigMapValue);
    Onyx.connect<OnyxCollectionKey>({
        key: config.resourceCollectionKey,
        waitForCollectionCallback: true,
        callback: (data) => {
            resources.set(config.resourceCollectionKey, data);
        },
    });
    Onyx.connect<OnyxPagesKey>({
        key: config.pageCollectionKey,
        waitForCollectionCallback: true,
        callback: (data) => {
            pages.set(config.pageCollectionKey, data);
        },
    });
}

function isPaginatedRequest(request: Request | PaginatedRequest): request is PaginatedRequest {
    return 'isPaginated' in request && request.isPaginated;
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
    const paginationConfig = paginationConfigs.get(request.command);
    if (!paginationConfig || !isPaginatedRequest(request)) {
        return requestResponse;
    }

    const {resourceCollectionKey, pageCollectionKey, sortItems, getItemID} = paginationConfig;
    const {resourceID} = request;
    return requestResponse.then((response) => {
        if (!response?.onyxData) {
            return Promise.resolve(response);
        }

        const resourceKey = `${resourceCollectionKey}${resourceID}` as const;
        const pageKey = `${pageCollectionKey}${resourceID}` as const;

        // Create a new page based on the response
        const pageItems = (response.onyxData.find((data) => data.key === resourceKey)?.value ?? {}) as OnyxValues[typeof resourceCollectionKey];
        const sortedPageItems = sortItems(pageItems);
        if (sortedPageItems.length === 0) {
            // Must have at least 1 action to create a page.
            Log.hmmm(`[Pagination] Did not receive any items in the response to ${request.command}`);
            return Promise.resolve(response);
        }

        const newPage = sortedPageItems.map((item) => getItemID(item));

        if (response.hasNewerActions === false) {
            newPage.unshift(CONST.PAGINATION_START_ID);
        }
        if (response.hasOlderActions === false) {
            newPage.push(CONST.PAGINATION_END_ID);
        }

        const resourceCollections = resources.get(resourceCollectionKey) ?? {};
        const existingItems = resourceCollections[resourceKey] ?? {};
        const allItems = fastMerge(existingItems, pageItems, true);
        const sortedAllItems = sortItems(allItems);

        const pagesCollections = pages.get(pageCollectionKey) ?? {};
        const existingPages = pagesCollections[pageKey] ?? [];
        const mergedPages = PaginationUtils.mergeAndSortContinuousPages(sortedAllItems, [...existingPages, newPage], getItemID);

        response.onyxData.push({
            key: pageKey,
            onyxMethod: Onyx.METHOD.SET,
            value: mergedPages,
        });

        return Promise.resolve(response);
    });
};

export {Pagination, registerPaginationConfig};
