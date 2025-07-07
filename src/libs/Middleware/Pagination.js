"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;
exports.registerPaginationConfig = registerPaginationConfig;
var fastMerge_1 = require("expensify-common/dist/fastMerge");
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var PaginationUtils_1 = require("@libs/PaginationUtils");
var CONST_1 = require("@src/CONST");
// Map of API commands to their pagination configs
var paginationConfigs = new Map();
// Local cache of paginated Onyx resources
var resources = new Map();
// Local cache of Onyx pages objects
var pages = new Map();
function registerPaginationConfig(_a) {
    var initialCommand = _a.initialCommand, previousCommand = _a.previousCommand, nextCommand = _a.nextCommand, config = __rest(_a, ["initialCommand", "previousCommand", "nextCommand"]);
    paginationConfigs.set(initialCommand, __assign(__assign({}, config), { type: 'initial' }));
    paginationConfigs.set(previousCommand, __assign(__assign({}, config), { type: 'previous' }));
    paginationConfigs.set(nextCommand, __assign(__assign({}, config), { type: 'next' }));
    react_native_onyx_1.default.connect({
        key: config.resourceCollectionKey,
        waitForCollectionCallback: true,
        callback: function (data) {
            resources.set(config.resourceCollectionKey, data);
        },
    });
    react_native_onyx_1.default.connect({
        key: config.pageCollectionKey,
        waitForCollectionCallback: true,
        callback: function (data) {
            pages.set(config.pageCollectionKey, data);
        },
    });
}
function isPaginatedRequest(request) {
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
var Pagination = function (requestResponse, request) {
    var paginationConfig = paginationConfigs.get(request.command);
    if (!paginationConfig || !isPaginatedRequest(request)) {
        return requestResponse;
    }
    var resourceCollectionKey = paginationConfig.resourceCollectionKey, pageCollectionKey = paginationConfig.pageCollectionKey, sortItems = paginationConfig.sortItems, getItemID = paginationConfig.getItemID, type = paginationConfig.type;
    var resourceID = request.resourceID, cursorID = request.cursorID;
    return requestResponse.then(function (response) {
        var _a, _b, _c, _d, _e, _f;
        if (!(response === null || response === void 0 ? void 0 : response.onyxData)) {
            return Promise.resolve(response);
        }
        var resourceKey = "".concat(resourceCollectionKey).concat(resourceID);
        var pageKey = "".concat(pageCollectionKey).concat(resourceID);
        // Create a new page based on the response
        var pageItems = ((_b = (_a = response.onyxData.find(function (data) { return data.key === resourceKey; })) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : {});
        var sortedPageItems = sortItems(pageItems, resourceID);
        if (sortedPageItems.length === 0) {
            // Must have at least 1 action to create a page.
            Log_1.default.hmmm("[Pagination] Did not receive any items in the response to ".concat(request.command));
            return Promise.resolve(response);
        }
        var newPage = sortedPageItems.map(function (item) { return getItemID(item); });
        if (response.hasNewerActions === false || (type === 'initial' && !cursorID)) {
            newPage.unshift(CONST_1.default.PAGINATION_START_ID);
        }
        if (response.hasOlderActions === false || response.hasOlderActions === null) {
            newPage.push(CONST_1.default.PAGINATION_END_ID);
        }
        var resourceCollections = (_c = resources.get(resourceCollectionKey)) !== null && _c !== void 0 ? _c : {};
        var existingItems = (_d = resourceCollections[resourceKey]) !== null && _d !== void 0 ? _d : {};
        var allItems = (0, fastMerge_1.default)(existingItems, pageItems, true);
        var sortedAllItems = sortItems(allItems, resourceID);
        var pagesCollections = (_e = pages.get(pageCollectionKey)) !== null && _e !== void 0 ? _e : {};
        var existingPages = (_f = pagesCollections[pageKey]) !== null && _f !== void 0 ? _f : [];
        var mergedPages = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedAllItems, __spreadArray(__spreadArray([], existingPages, true), [newPage], false), getItemID);
        response.onyxData.push({
            key: pageKey,
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            value: mergedPages,
        });
        return Promise.resolve(response);
    });
};
exports.Pagination = Pagination;
