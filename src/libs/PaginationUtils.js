"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Finds the id and index in sortedItems of the first item in the given page that's present in sortedItems.
 */
function findFirstItem(sortedItems, page, getID) {
    var _loop_1 = function (id) {
        if (id === CONST_1.default.PAGINATION_START_ID) {
            return { value: { id: id, index: 0 } };
        }
        var index = sortedItems.findIndex(function (item) { return getID(item) === id; });
        if (index !== -1) {
            return { value: { id: id, index: index } };
        }
    };
    for (var _i = 0, page_1 = page; _i < page_1.length; _i++) {
        var id = page_1[_i];
        var state_1 = _loop_1(id);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return null;
}
/**
 * Finds the id and index in sortedItems of the last item in the given page that's present in sortedItems.
 */
function findLastItem(sortedItems, page, getID) {
    var _loop_2 = function (i) {
        var id = page.at(i);
        if (id === CONST_1.default.PAGINATION_END_ID) {
            return { value: { id: id, index: sortedItems.length - 1 } };
        }
        var index = sortedItems.findIndex(function (item) { return getID(item) === id; });
        if (index !== -1 && id) {
            return { value: { id: id, index: index } };
        }
    };
    for (var i = page.length - 1; i >= 0; i--) {
        var state_2 = _loop_2(i);
        if (typeof state_2 === "object")
            return state_2.value;
    }
    return null;
}
/**
 * Finds the index and id of the first and last items of each page in `sortedItems`.
 */
function getPagesWithIndexes(sortedItems, pages, getID) {
    return pages
        .map(function (page) {
        var firstItem = findFirstItem(sortedItems, page, getID);
        var lastItem = findLastItem(sortedItems, page, getID);
        // If all actions in the page are not found it will be removed.
        if (firstItem === null || lastItem === null) {
            return null;
        }
        // In case actions were reordered, we need to swap them.
        if (firstItem.index > lastItem.index) {
            var temp = firstItem;
            firstItem = lastItem;
            lastItem = temp;
        }
        var ids = sortedItems.slice(firstItem.index, lastItem.index + 1).map(function (item) { return getID(item); });
        if (firstItem.id === CONST_1.default.PAGINATION_START_ID) {
            ids.unshift(CONST_1.default.PAGINATION_START_ID);
        }
        if (lastItem.id === CONST_1.default.PAGINATION_END_ID) {
            ids.push(CONST_1.default.PAGINATION_END_ID);
        }
        return {
            ids: ids,
            firstID: firstItem.id,
            firstIndex: firstItem.index,
            lastID: lastItem.id,
            lastIndex: lastItem.index,
        };
    })
        .filter(function (page) { return page !== null; });
}
/**
 * Given a sorted array of items and an array of Pages of item IDs, find any overlapping pages and merge them together.
 */
function mergeAndSortContinuousPages(sortedItems, pages, getItemID) {
    var pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getItemID);
    if (pagesWithIndexes.length === 0) {
        return [];
    }
    // Pages need to be sorted by firstIndex ascending then by lastIndex descending
    var sortedPages = pagesWithIndexes.sort(function (a, b) {
        if (a.firstIndex !== b.firstIndex || a.firstID !== b.firstID) {
            if (a.firstID === CONST_1.default.PAGINATION_START_ID) {
                return -1;
            }
            return a.firstIndex - b.firstIndex;
        }
        if (a.lastID === CONST_1.default.PAGINATION_END_ID) {
            return 1;
        }
        return b.lastIndex - a.lastIndex;
    });
    var result = [sortedPages.at(0)];
    for (var i = 1; i < sortedPages.length; i++) {
        var page = sortedPages.at(i);
        var prevPage = result.at(-1);
        if (!page || !prevPage) {
            // eslint-disable-next-line no-continue
            continue;
        }
        // Current page is inside the previous page, skip
        if (page.lastIndex <= prevPage.lastIndex && page.lastID !== CONST_1.default.PAGINATION_END_ID) {
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
    return result.map(function (page) { var _a; return (_a = page === null || page === void 0 ? void 0 : page.ids) !== null && _a !== void 0 ? _a : []; });
}
/**
 * Returns the page of items that contains the item with the given ID, or the first page if null.
 * Also returns whether next / previous pages can be fetched.
 * See unit tests for example of inputs and expected outputs.
 *
 * Note: sortedItems should be sorted in descending order.
 */
function getContinuousChain(sortedItems, pages, getID, id) {
    if (pages.length === 0) {
        var dataItem = sortedItems.find(function (item) { return getID(item) === id; });
        return { data: id && !dataItem ? [] : sortedItems, hasNextPage: false, hasPreviousPage: false };
    }
    var pagesWithIndexes = getPagesWithIndexes(sortedItems, pages, getID);
    var page = {
        ids: [],
        firstID: '',
        firstIndex: 0,
        lastID: '',
        lastIndex: 0,
    };
    if (id) {
        var index_1 = sortedItems.findIndex(function (item) { return getID(item) === id; });
        // If we are linking to an action that doesn't exist in Onyx, return an empty array
        if (index_1 === -1) {
            return { data: [], hasNextPage: false, hasPreviousPage: false };
        }
        var linkedPage = pagesWithIndexes.find(function (pageIndex) { return index_1 >= pageIndex.firstIndex && index_1 <= pageIndex.lastIndex; });
        var item = sortedItems.at(index_1);
        // If we are linked to an action in a gap return it by itself
        if (!linkedPage && item) {
            return { data: [item], hasNextPage: false, hasPreviousPage: false };
        }
        if (linkedPage) {
            page = linkedPage;
        }
    }
    else {
        var pageAtIndex0 = pagesWithIndexes.at(0);
        if (pageAtIndex0) {
            page = pageAtIndex0;
        }
    }
    if (!page) {
        return { data: sortedItems, hasNextPage: false, hasPreviousPage: false };
    }
    return { data: sortedItems.slice(page.firstIndex, page.lastIndex + 1), hasNextPage: page.lastID !== CONST_1.default.PAGINATION_END_ID, hasPreviousPage: page.firstID !== CONST_1.default.PAGINATION_START_ID };
}
exports.default = { mergeAndSortContinuousPages: mergeAndSortContinuousPages, getContinuousChain: getContinuousChain };
