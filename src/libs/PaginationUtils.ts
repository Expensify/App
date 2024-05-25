import CONST from '@src/CONST';
import type Pages from '@src/types/onyx/Pages';

type PageWithIndex = {
    ids: string[];
    firstID: string;
    firstIndex: number;
    lastID: string;
    lastIndex: number;
};

function getPagesWithIndexes<TResource>(sortedItems: TResource[], pages: Pages, getID: (item: TResource) => string): PageWithIndex[] {
    return pages.map((page) => {
        const firstID = page[0];
        const lastID = page[page.length - 1];
        return {
            ids: page,
            firstID,
            // TODO: What if the ID is not in the list? Could happen if an action is deleted from another device.
            firstIndex: firstID === CONST.PAGINATION_START_ID ? 0 : sortedItems.findIndex((item) => getID(item) === firstID),
            lastID,
            lastIndex: lastID === CONST.PAGINATION_END_ID ? sortedItems.length - 1 : sortedItems.findIndex((item) => getID(item) === lastID),
        };
    });
}

function mergeContinuousPages<TResource>(sortedItems: TResource[], pages: Pages, getItemID: (item: TResource) => string): Pages {
    const pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getItemID);

    // Pages need to be sorted by firstIndex ascending then by lastIndex descending
    const sortedPages = pagesWithIndexes.sort((a, b) => {
        if (a.firstIndex !== b.firstIndex) {
            return a.firstIndex - b.firstIndex;
        }
        return b.lastIndex - a.lastIndex;
    });

    const result = [sortedPages[0]];
    for (let i = 1; i < sortedPages.length; i++) {
        const page = sortedPages[i];
        const prevPage = sortedPages[i - 1];

        // Current page is inside the previous page, skip
        if (page.lastIndex <= prevPage.lastIndex) {
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

    return result.map((page) => page.ids);
}

export default {mergeContinuousPages};
