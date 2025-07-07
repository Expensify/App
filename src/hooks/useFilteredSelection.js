"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * Custom hook to manage a selection of keys from a given set of options.
 * It filters the selected keys based on a provided filter function whenever the options or the filter change.
 *
 * @param options - Option data
 * @param filter - Filter function
 * @returns A tuple containing the array of selected keys and a function to update the selected keys.
 */
function useFilteredSelection(options, filter) {
    var _a = (0, react_1.useState)([]), selectedOptions = _a[0], setSelectedOptions = _a[1];
    (0, react_1.useEffect)(function () { return setSelectedOptions(function (prevOptions) { return prevOptions.filter(function (key) { return filter(options === null || options === void 0 ? void 0 : options[key]); }); }); }, [options, filter]);
    return [selectedOptions, setSelectedOptions];
}
exports.default = useFilteredSelection;
