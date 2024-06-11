// TODO: Is this a legit use case for exposing `OnyxCache`, or should we use `Onyx.connect`?
import fastMerge from 'expensify-common/dist/fastMerge';
import Onyx from 'react-native-onyx';
import type {ApiCommand} from '@libs/API/types';
import Log from '@libs/Log';
import PaginationUtils from '@libs/PaginationUtils';
import CONST from '@src/CONST';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

type PaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey> = {
    initialCommand: ApiCommand;
    previousCommand: ApiCommand;
    nextCommand: ApiCommand;
    resourceCollectionKey: TResourceKey;
    pageCollectionKey: TPageKey;
    sortItems: (items: OnyxValues[TResourceKey]) => Array<OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never>;
    getItemID: (item: OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never) => string;
};

type PaginationConfigMapValue = Omit<PaginationConfig<OnyxCollectionKey, OnyxPagesKey>, 'initialCommand' | 'previousCommand' | 'nextCommand'> & {
    type: 'initial' | 'next' | 'previous';
};

const paginationConfigs = new Map<string, PaginationConfigMapValue>();
const ressources = new Map<OnyxCollectionKey, OnyxValues[OnyxCollectionKey] | null>();
const pages = new Map<OnyxPagesKey, OnyxValues[OnyxPagesKey] | null>();

function registerPaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey>({
    initialCommand,
    previousCommand,
    nextCommand,
    ...config
}: PaginationConfig<TResourceKey, TPageKey>): void {
    // TODO: Is there a way to avoid these casts?
    paginationConfigs.set(initialCommand, {...config, type: 'initial'} as unknown as PaginationConfigMapValue);
    paginationConfigs.set(previousCommand, {...config, type: 'previous'} as unknown as PaginationConfigMapValue);
    paginationConfigs.set(nextCommand, {...config, type: 'next'} as unknown as PaginationConfigMapValue);
    Onyx.connect({
        key: config.resourceCollectionKey,
        callback: (data) => {
            ressources.set(config.resourceCollectionKey, data);
        },
    });
    Onyx.connect({
        key: config.pageCollectionKey,
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
 * 4. Updating the saves pages in Onyx for that resource.
 *
 * It does this to keep track of what it's fetched via pagination and what may have showed up from other sources,
 * so it can keep track of and fill any potential gaps in paginated lists.
 */
const Pagination: Middleware = (requestResponse, request) => {
    const paginationConfig = paginationConfigs.get(request.command);
    if (!paginationConfig || !isPaginatedRequest(request)) {
        return requestResponse;
    }

    const {resourceCollectionKey, pageCollectionKey, sortItems, getItemID, type} = paginationConfig;
    const {resourceID, cursorID} = request;
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

        // Detect if we are at the start of the list. This will always be the case for the initial request with no cursor.
        // For previous requests we check that no new data is returned. Ideally the server would return that info.
        if ((type === 'initial' && !cursorID) || (type === 'next' && newPage.length === 1 && newPage[0] === cursorID)) {
            newPage.unshift(CONST.PAGINATION_START_ID);
        }

        const existingItems = ressources.get(resourceCollectionKey) ?? {};
        const allItems = fastMerge(existingItems, pageItems, true);
        const sortedAllItems = sortItems(allItems);

        const existingPages = pages.get(pageCollectionKey) ?? [];
        const mergedPages = PaginationUtils.mergeContinuousPages(sortedAllItems, [...existingPages, newPage], getItemID);

        response.onyxData.push({
            key: pageKey,
            onyxMethod: Onyx.METHOD.SET,
            value: mergedPages,
        });

        return Promise.resolve(response);
    });
};

export {Pagination, registerPaginationConfig};
