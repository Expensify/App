import CONST from '@src/CONST';
import type Pages from '@src/types/onyx/Pages';

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
            // eslint-disable-next-line no-continue
            continue;
        }

        // Current page is inside the previous page, skip
        if (page.lastIndex <= prevPage.lastIndex && page.lastID !== CONST.PAGINATION_END_ID) {
            // eslint-disable-next-line no-continue
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
            // eslint-disable-next-line no-continue
            continue;
        }

        // No overlap, add the current page as is.
        result.push(page);
    }

    return result.map((page) => page?.ids ?? []);
}

/**
 * Returns the page of items that contains the item with the given ID, or the first page if null.
 * See unit tests for example of inputs and expected outputs.
 *
 * Note: sortedItems should be sorted in descending order.
 */
function getContinuousChain<TResource>(sortedItems: TResource[], pages: Pages, getID: (item: TResource) => string, id?: string): TResource[] {
    if (pages.length === 0) {
        return id ? [] : sortedItems;
    }

    const pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getID);

    let page: PageWithIndex = {
        ids: [],
        firstID: '',
        firstIndex: 0,
        lastID: '',
        lastIndex: 0,
    };

    if (id) {
        const index = sortedItems.findIndex((item) => getID(item) === id);

        // If we are linking to an action that doesn't exist in Onyx, return an empty array
        if (index === -1) {
            return [];
        }

        const linkedPage = pagesWithIndexes.find((pageIndex) => index >= pageIndex.firstIndex && index <= pageIndex.lastIndex);

        const item = sortedItems.at(index);
        // If we are linked to an action in a gap return it by itself
        if (!linkedPage && item) {
            return [item];
        }

        if (linkedPage) {
            page = linkedPage;
        }
    } else {
        const pageAtIndex0 = pagesWithIndexes.at(0);
        if (pageAtIndex0) {
            page = pageAtIndex0;
        }
    }

    return page ? sortedItems.slice(page.firstIndex, page.lastIndex + 1) : sortedItems;
}

export default {mergeAndSortContinuousPages, getContinuousChain};
