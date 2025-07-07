"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var usePrevious_1 = require("./usePrevious");
/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * It utilizes `useTransition` to allow the searchQuery to change rapidly, while more expensive renders that occur using
 * the result of the filtering and sorting are de-prioritized, allowing them to happen in the background.
 */
function useSearchResults(data, filterData, sortData) {
    if (sortData === void 0) { sortData = function (d) { return d; }; }
    var _a = (0, react_1.useState)(''), inputValue = _a[0], setInputValue = _a[1];
    var _b = (0, react_1.useState)(data), result = _b[0], setResult = _b[1];
    var prevData = (0, usePrevious_1.default)(data);
    var _c = (0, react_1.useTransition)(), startTransition = _c[1];
    (0, react_1.useEffect)(function () {
        startTransition(function () {
            var normalizedSearchQuery = inputValue.trim().toLowerCase();
            var filtered = normalizedSearchQuery.length ? data.filter(function (item) { return filterData(item, normalizedSearchQuery); }) : data;
            var sorted = sortData(filtered);
            setResult(sorted);
        });
    }, [data, filterData, inputValue, sortData]);
    (0, react_1.useEffect)(function () {
        if (prevData.length <= CONST_1.default.SEARCH_ITEM_LIMIT || data.length > CONST_1.default.SEARCH_ITEM_LIMIT) {
            return;
        }
        setInputValue('');
    }, [data, prevData]);
    return [inputValue, setInputValue, result];
}
exports.default = useSearchResults;
