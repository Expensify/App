"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useArrowKeyFocusManager;
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var useKeyboardShortcut_1 = require("./useKeyboardShortcut");
var usePrevious_1 = require("./usePrevious");
/**
 * A hook that makes it easy to use the arrow keys to manage focus of items in a list
 *
 * Recommendation: To ensure stability, wrap the `onFocusedIndexChange` function with the useCallback hook before using it with this hook.
 *
 * @param config.maxIndex – typically the number of items in your list
 * @param [config.onFocusedIndexChange] – optional callback to execute when focusedIndex changes
 * @param [config.initialFocusedIndex] – where to start in the list
 * @param [config.disabledIndexes] – An array of indexes to disable + skip over
 * @param [config.shouldExcludeTextAreaNodes] – Whether arrow keys should have any effect when a TextArea node is focused
 * @param [config.isActive] – Whether the component is ready and should subscribe to KeyboardShortcut
 * @param [config.itemsPerRow] – The number of items per row. If provided, the arrow keys will move focus horizontally as well as vertically
 * @param [config.disableCyclicTraversal] – Whether to disable cyclic traversal of the list. If true, the arrow keys will have no effect when the first or last item is focused
 * @param [config.allowHorizontalArrowKeys] – Whether to enable the right/left keys
 * @param [config.isFocused] Whether navigation is focused
 */
function useArrowKeyFocusManager(_a) {
    var maxIndex = _a.maxIndex, _b = _a.onFocusedIndexChange, onFocusedIndexChange = _b === void 0 ? function () { } : _b, _c = _a.initialFocusedIndex, initialFocusedIndex = _c === void 0 ? 0 : _c, 
    // The "disabledIndexes" array needs to be stable to prevent the "useCallback" hook from being recreated unnecessarily.
    // Hence the use of CONST.EMPTY_ARRAY.
    _d = _a.disabledIndexes, 
    // The "disabledIndexes" array needs to be stable to prevent the "useCallback" hook from being recreated unnecessarily.
    // Hence the use of CONST.EMPTY_ARRAY.
    disabledIndexes = _d === void 0 ? CONST_1.default.EMPTY_ARRAY : _d, _e = _a.shouldExcludeTextAreaNodes, shouldExcludeTextAreaNodes = _e === void 0 ? true : _e, isActive = _a.isActive, itemsPerRow = _a.itemsPerRow, _f = _a.disableCyclicTraversal, disableCyclicTraversal = _f === void 0 ? false : _f, _g = _a.allowHorizontalArrowKeys, allowHorizontalArrowKeys = _g === void 0 ? false : _g, _h = _a.allowNegativeIndexes, allowNegativeIndexes = _h === void 0 ? false : _h, _j = _a.isFocused, isFocused = _j === void 0 ? true : _j, setHasKeyBeenPressed = _a.setHasKeyBeenPressed;
    var _k = (0, react_1.useState)(initialFocusedIndex), focusedIndex = _k[0], setFocusedIndex = _k[1];
    var prevIsFocusedIndex = (0, usePrevious_1.default)(focusedIndex);
    var arrowConfig = (0, react_1.useMemo)(function () { return ({
        excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        isActive: isActive,
    }); }, [isActive, shouldExcludeTextAreaNodes]);
    var horizontalArrowConfig = (0, react_1.useMemo)(function () { return ({
        excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        isActive: isActive && allowHorizontalArrowKeys,
    }); }, [isActive, shouldExcludeTextAreaNodes, allowHorizontalArrowKeys]);
    (0, react_1.useEffect)(function () {
        if (prevIsFocusedIndex === focusedIndex) {
            return;
        }
        onFocusedIndexChange(focusedIndex);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [focusedIndex, prevIsFocusedIndex]);
    var arrowUpCallback = (0, react_1.useCallback)(function () {
        if (maxIndex < 0 || !isFocused) {
            return;
        }
        var nextIndex = disableCyclicTraversal ? -1 : maxIndex;
        setHasKeyBeenPressed === null || setHasKeyBeenPressed === void 0 ? void 0 : setHasKeyBeenPressed();
        setFocusedIndex(function (actualIndex) {
            var currentFocusedIndex = actualIndex > 0 ? actualIndex - (itemsPerRow !== null && itemsPerRow !== void 0 ? itemsPerRow : 1) : nextIndex;
            var newFocusedIndex = currentFocusedIndex;
            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex -= itemsPerRow !== null && itemsPerRow !== void 0 ? itemsPerRow : 1;
                if (newFocusedIndex < 0) {
                    if (disableCyclicTraversal) {
                        if (!allowNegativeIndexes) {
                            return actualIndex;
                        }
                        break;
                    }
                    newFocusedIndex = maxIndex;
                }
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex; // no-op
                }
            }
            return newFocusedIndex;
        });
    }, [maxIndex, isFocused, disableCyclicTraversal, itemsPerRow, disabledIndexes, allowNegativeIndexes, setHasKeyBeenPressed]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_UP, arrowUpCallback, arrowConfig);
    var arrowDownCallback = (0, react_1.useCallback)(function () {
        if (maxIndex < 0 || !isFocused) {
            return;
        }
        setHasKeyBeenPressed === null || setHasKeyBeenPressed === void 0 ? void 0 : setHasKeyBeenPressed();
        var nextIndex = disableCyclicTraversal ? maxIndex : 0;
        setFocusedIndex(function (actualIndex) {
            var currentFocusedIndex = -1;
            if (actualIndex === -1) {
                currentFocusedIndex = 0;
            }
            else {
                currentFocusedIndex = actualIndex < maxIndex ? actualIndex + (itemsPerRow !== null && itemsPerRow !== void 0 ? itemsPerRow : 1) : nextIndex;
            }
            if (disableCyclicTraversal && currentFocusedIndex > maxIndex) {
                return actualIndex;
            }
            var newFocusedIndex = currentFocusedIndex;
            while (disabledIndexes.includes(newFocusedIndex)) {
                if (actualIndex < 0) {
                    newFocusedIndex += 1;
                }
                else {
                    newFocusedIndex += itemsPerRow !== null && itemsPerRow !== void 0 ? itemsPerRow : 1;
                }
                if (newFocusedIndex > maxIndex) {
                    if (disableCyclicTraversal) {
                        return actualIndex;
                    }
                    newFocusedIndex = 0;
                }
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex;
                }
            }
            return newFocusedIndex;
        });
    }, [disableCyclicTraversal, disabledIndexes, isFocused, itemsPerRow, maxIndex, setHasKeyBeenPressed]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_DOWN, arrowDownCallback, arrowConfig);
    var arrowLeftCallback = (0, react_1.useCallback)(function () {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }
        var nextIndex = disableCyclicTraversal ? -1 : maxIndex;
        setFocusedIndex(function (actualIndex) {
            var currentFocusedIndex = actualIndex > 0 ? actualIndex - 1 : nextIndex;
            var newFocusedIndex = currentFocusedIndex;
            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : nextIndex;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex; // no-op
                }
            }
            return newFocusedIndex;
        });
    }, [allowHorizontalArrowKeys, disableCyclicTraversal, disabledIndexes, maxIndex]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, horizontalArrowConfig);
    var arrowRightCallback = (0, react_1.useCallback)(function () {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }
        var nextIndex = disableCyclicTraversal ? maxIndex : 0;
        setFocusedIndex(function (actualIndex) {
            var currentFocusedIndex = actualIndex < maxIndex ? actualIndex + 1 : nextIndex;
            var newFocusedIndex = currentFocusedIndex;
            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < maxIndex ? newFocusedIndex + 1 : nextIndex;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex;
                }
            }
            return newFocusedIndex;
        });
    }, [allowHorizontalArrowKeys, disableCyclicTraversal, disabledIndexes, maxIndex]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, horizontalArrowConfig);
    // Note: you don't need to manually manage focusedIndex in the parent. setFocusedIndex is only exposed in case you want to reset focusedIndex or focus a specific item
    return [focusedIndex, setFocusedIndex];
}
