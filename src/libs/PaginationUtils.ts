import CONST from '@src/CONST';
import type Pages from '@src/types/onyx/Pages';

function isPaginationMarker(id: string): boolean {
    return id === CONST.PAGINATION_START_ID || id === CONST.PAGINATION_END_ID;
}

function buildIDToIndexMap<TResource>(sortedItems: TResource[], getID: (item: TResource) => string): Map<string, number> {
    const map = new Map<string, number>();
    let index = 0;
    for (const item of sortedItems) {
        map.set(getID(item), index);
        index++;
    }
    return map;
}

type PageWithIndex = {
    /** The IDs we store in Onyx and which make up the page. */
    ids: string[];

    /** The first ID in the page. */
    firstID: string;

    /** The index of the first ID in the page in the complete set of sorted items. */
    firstIndex: number;

    /** The last ID in the page. */
    lastID: string;

    /** The index of the last ID in the page in the complete set of sorted items. */
    lastIndex: number;
};

// It's useful to be able to reference and item along with its index in a sorted array,
// since the index is needed for ordering but the id is what we actually store.
type ItemWithIndex = {
    id: string;
    index: number;
};

type ResourceItemResult<TResource> = {
    index: number;
    id: string;
    item: TResource;
};

type ContinuousPageChainResult<TResource> = {
    data: TResource[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    resourceItem?: ResourceItemResult<TResource>;
};

/**
 * Finds the id and index in sortedItems of the first item in the given page that's present in sortedItems.
 */
function findFirstItem<TResource>(sortedItems: TResource[], page: string[], getID: (item: TResource) => string): ItemWithIndex | null {
    for (const id of page) {
        if (id === CONST.PAGINATION_START_ID) {
            return {id, index: 0};
        }
        const index = sortedItems.findIndex((item) => getID(item) === id);
        if (index !== -1) {
            return {id, index};
        }
    }
    return null;
}

/**
 * Finds the id and index in sortedItems of the last item in the given page that's present in sortedItems.
 */
function findLastItem<TResource>(sortedItems: TResource[], page: string[], getID: (item: TResource) => string): ItemWithIndex | null {
    for (let i = page.length - 1; i >= 0; i--) {
        const id = page.at(i);
        if (id === CONST.PAGINATION_END_ID) {
            return {id, index: sortedItems.length - 1};
        }
        const index = sortedItems.findIndex((item) => getID(item) === id);
        if (index !== -1 && id) {
            return {id, index};
        }
    }
    return null;
}

/**
 * Finds the index and id of the first and last items of each page in `sortedItems`.
 */
function getPagesWithIndexes<TResource>(sortedItems: TResource[], pages: Pages, getID: (item: TResource) => string): PageWithIndex[] {
    return pages
        .map((page) => {
            let firstItem = findFirstItem(sortedItems, page, getID);
            let lastItem = findLastItem(sortedItems, page, getID);

            // If all actions in the page are not found it will be removed.
            if (firstItem === null || lastItem === null) {
                return null;
            }

            // In case actions were reordered, we need to swap them.
            if (firstItem.index > lastItem.index) {
                const temp = firstItem;
                firstItem = lastItem;
                lastItem = temp;
            }

            const ids = sortedItems.slice(firstItem.index, lastItem.index + 1).map((item) => getID(item));
            if (firstItem.id === CONST.PAGINATION_START_ID) {
                ids.unshift(CONST.PAGINATION_START_ID);
            }
            if (lastItem.id === CONST.PAGINATION_END_ID) {
                ids.push(CONST.PAGINATION_END_ID);
            }

            return {
                ids,
                firstID: firstItem.id,
                firstIndex: firstItem.index,
                lastID: lastItem.id,
                lastIndex: lastItem.index,
            };
        })
        .filter((page): page is PageWithIndex => page !== null);
}

/**
 * Given a sorted array of items and an array of Pages of item IDs, find any overlapping pages and merge them together.
 */
function mergeAndSortContinuousPages<TResource>(sortedItems: TResource[], pages: Pages, getItemID: (item: TResource) => string): Pages {
    const pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getItemID);
    if (pagesWithIndexes.length === 0) {
        return [];
    }

    // Pages need to be sorted by firstIndex ascending then by lastIndex descending
    const sortedPages = pagesWithIndexes.sort((a, b) => {
        if (a.firstIndex !== b.firstIndex || a.firstID !== b.firstID) {
            if (a.firstID === CONST.PAGINATION_START_ID) {
                return -1;
            }
            return a.firstIndex - b.firstIndex;
        }
        if (a.lastID === CONST.PAGINATION_END_ID) {
            return 1;
        }
        return b.lastIndex - a.lastIndex;
    });

    const result = [sortedPages.at(0)];
    for (let i = 1; i < sortedPages.length; i++) {
        const page = sortedPages.at(i);
        const prevPage = result.at(-1);

        if (!page || !prevPage) {
            continue;
        }

        // Current page is inside the previous page, skip
        if (page.lastIndex <= prevPage.lastIndex && page.lastID !== CONST.PAGINATION_END_ID) {
            continue;
        }

        // Current page overlaps with the previous page, merge.
        // This happens if the ids from the current page and previous page are the same or if the indexes overlap
        if (page.firstID === prevPage.lastID || page.firstIndex < prevPage.lastIndex) {
            result[result.length - 1] = {
                firstID: prevPage.firstID,
                firstIndex: prevPage.firstIndex,
                lastID: page.lastID,
                lastIndex: page.lastIndex,
                // Only add items from prevPage that are not included in page in case of overlap.
                ids: prevPage.ids.slice(0, prevPage.ids.indexOf(page.firstID)).concat(page.ids),
            };
            continue;
        }

        // No overlap, add the current page as is.
        result.push(page);
    }

    return result.map((page) => page?.ids ?? []);
}

type PageWithSortKey = {
    ids: string[];
    firstIndex: number;
    lastIndex: number;
};

function getFirstAndLastIndexForPage(page: string[], idToIndex: Map<string, number>, lastIndexInSortedItems: number): {firstIndex: number; lastIndex: number} | null {
    let firstIndex: number | undefined;
    let lastIndex: number | undefined;

    for (const id of page) {
        if (id === CONST.PAGINATION_START_ID) {
            firstIndex = 0;
            continue;
        }

        const index = idToIndex.get(id);
        if (index === undefined) {
            continue;
        }

        if (firstIndex === undefined || index < firstIndex) {
            firstIndex = index;
        }
        if (lastIndex === undefined || index > lastIndex) {
            lastIndex = index;
        }
    }

    for (let i = page.length - 1; i >= 0; i--) {
        const id = page.at(i);
        if (id === CONST.PAGINATION_END_ID) {
            lastIndex = lastIndexInSortedItems;
            break;
        }
    }

    if (firstIndex === undefined || lastIndex === undefined) {
        return null;
    }

    return {firstIndex, lastIndex};
}

function pagesShareAnyNonMarkerID(pageA: string[], pageB: string[]): boolean {
    const a = pageA.filter((id) => !isPaginationMarker(id));
    const b = pageB.filter((id) => !isPaginationMarker(id));

    if (a.length === 0 || b.length === 0) {
        return false;
    }

    const [smaller, larger] = a.length <= b.length ? [a, b] : [b, a];
    const set = new Set(smaller);
    for (const id of larger) {
        if (set.has(id)) {
            return true;
        }
    }
    return false;
}

function mergeTwoPagesByUnionAndSort<TResource>(sortedItems: TResource[], pageA: string[], pageB: string[], getItemID: (item: TResource) => string): string[] {
    const idToIndex = buildIDToIndexMap(sortedItems, getItemID);

    const hasStart = pageA.at(0) === CONST.PAGINATION_START_ID || pageB.at(0) === CONST.PAGINATION_START_ID;
    const hasEnd = pageA.at(-1) === CONST.PAGINATION_END_ID || pageB.at(-1) === CONST.PAGINATION_END_ID;

    const uniqueIDs = new Set<string>();
    for (const id of [...pageA, ...pageB]) {
        if (isPaginationMarker(id)) {
            continue;
        }
        if (!idToIndex.has(id)) {
            continue;
        }
        uniqueIDs.add(id);
    }

    const sortedIDs = [...uniqueIDs].sort((a, b) => (idToIndex.get(a) ?? 0) - (idToIndex.get(b) ?? 0));
    if (hasStart) {
        sortedIDs.unshift(CONST.PAGINATION_START_ID);
    }
    if (hasEnd) {
        sortedIDs.push(CONST.PAGINATION_END_ID);
    }
    return sortedIDs;
}

/**
 * Merge pages only when they have clear ID-overlap evidence.
 *
 * This intentionally does NOT use index overlap between pages to infer continuity, because when we
 * open a report in the middle of the chat (e.g. last-unread), the locally available action set may
 * not contain the actions in the gap, making disjoint pages appear overlapping.
 */
function mergePagesByIDOverlap<TResource>(sortedItems: TResource[], pages: Pages, getItemID: (item: TResource) => string): Pages {
    if (pages.length === 0) {
        return [];
    }

    const idToIndex = buildIDToIndexMap(sortedItems, getItemID);
    const lastIndexInSortedItems = Math.max(0, sortedItems.length - 1);

    const pagesWithKeys: PageWithSortKey[] = [];
    for (const page of pages) {
        const indexes = getFirstAndLastIndexForPage(page, idToIndex, lastIndexInSortedItems);
        if (!indexes) {
            continue;
        }

        // Remove any IDs we don't currently have so stored pages don't imply we have the gap contents.
        const filteredIDs = page.filter((id) => isPaginationMarker(id) || idToIndex.has(id));
        pagesWithKeys.push({...indexes, ids: filteredIDs});
    }

    if (pagesWithKeys.length === 0) {
        return [];
    }

    pagesWithKeys.sort((a, b) => a.firstIndex - b.firstIndex);

    const result: string[][] = [pagesWithKeys.at(0)?.ids ?? []];
    for (let i = 1; i < pagesWithKeys.length; i++) {
        const current = pagesWithKeys.at(i)?.ids ?? [];
        const previous = result.at(-1) ?? [];

        const shouldMerge = current.at(0) === previous.at(-1) || pagesShareAnyNonMarkerID(previous, current);
        if (!shouldMerge) {
            result.push(current);
            continue;
        }

        result[result.length - 1] = mergeTwoPagesByUnionAndSort(sortedItems, previous, current, getItemID);
    }

    return result;
}

/**
 * Picks the chronologically newest page: prefers the slice marked with PAGINATION_START_ID (synced to present),
 * otherwise the page whose span starts at the smallest index in descending-sorted items.
 */
function selectNewestPageWithIndex(pagesWithIndexes: PageWithIndex[]): PageWithIndex | undefined {
    if (pagesWithIndexes.length === 0) {
        return undefined;
    }

    const pageWithStartMarker = pagesWithIndexes.find((pageWithIndex) => pageWithIndex.firstID === CONST.PAGINATION_START_ID);
    if (pageWithStartMarker) {
        return pageWithStartMarker;
    }

    return pagesWithIndexes.reduce((newest, candidate) => (candidate.firstIndex < newest.firstIndex ? candidate : newest));
}

/**
 * Collapses pagination to a single page row for the newest window. Used after jumping to the live tail of a chat.
 */
function prunePagesToNewestWindow<TResource>(sortedItems: TResource[], pages: Pages, getID: (item: TResource) => string): Pages {
    if (pages.length <= 1) {
        return pages;
    }

    const pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getID);
    const newestPage = selectNewestPageWithIndex(pagesWithIndexes);
    if (!newestPage) {
        return pages;
    }

    return [newestPage.ids];
}

/**
 * Returns the page of items that contains the item with the given ID, or the first page if null.
 * Also returns whether next / previous pages can be fetched.
 * See unit tests for example of inputs and expected outputs.
 *
 * Note: sortedItems should be sorted in descending order.
 */
function getContinuousChain<TResource>(sortedItems: TResource[], pages: Pages, getID: (item: TResource) => string, id?: string): ContinuousPageChainResult<TResource> {
    // If an id is provided, find the index of the item with that id
    let index = -1;

    if (id) {
        index = sortedItems.findIndex((item) => getID(item) === id);
    }
    const didFindItem = index !== -1;

    // Return the found resource item if it exists
    let resourceItem: ResourceItemResult<TResource> | undefined;
    if (didFindItem) {
        const item = sortedItems.at(index);
        if (item) {
            resourceItem = {
                index,
                item,
                id: getID(item),
            };
        }
    }

    if (pages.length === 0) {
        return {data: !!id && !didFindItem ? [] : sortedItems, hasNextPage: false, hasPreviousPage: false, resourceItem};
    }

    const pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getID);

    let page: PageWithIndex = {
        ids: [],
        firstID: '',
        firstIndex: 0,
        lastID: '',
        lastIndex: 0,
    };

    // If we found an item with the resource id, we want link to the specific page with the item
    if (id) {
        // If we are searching for an item with a specific resource id and
        // we are linking to an action that doesn't exist in Onyx, return an empty array
        if (!didFindItem) {
            return {data: [], hasNextPage: false, hasPreviousPage: false, resourceItem};
        }

        const linkedPage = pagesWithIndexes.find((pageIndex) => index >= pageIndex.firstIndex && index <= pageIndex.lastIndex);

        // If we are linked to an action in a gap return it by itself
        if (!linkedPage && resourceItem) {
            return {data: [resourceItem.item], hasNextPage: false, hasPreviousPage: false, resourceItem};
        }

        if (linkedPage) {
            page = linkedPage;
        }
    } else {
        // If we did not find an item with the resource id, show the newest page (not rely on arbitrary Onyx page order).
        const newestPage = selectNewestPageWithIndex(pagesWithIndexes);
        if (newestPage) {
            page = newestPage;
        }
    }

    if (!page) {
        return {data: sortedItems, hasNextPage: false, hasPreviousPage: false, resourceItem};
    }

    return {
        data: sortedItems.slice(page.firstIndex, page.lastIndex + 1),
        hasNextPage: page.lastID !== CONST.PAGINATION_END_ID,
        hasPreviousPage: page.firstID !== CONST.PAGINATION_START_ID,
        resourceItem,
    };
}

export {mergeAndSortContinuousPages, mergePagesByIDOverlap, getContinuousChain, prunePagesToNewestWindow, selectNewestPageWithIndex};

export default {mergeAndSortContinuousPages, mergePagesByIDOverlap, getContinuousChain, prunePagesToNewestWindow, selectNewestPageWithIndex};
