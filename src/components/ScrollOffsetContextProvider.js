"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollOffsetContext = void 0;
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var defaultValue = {
    saveScrollOffset: function () { },
    getScrollOffset: function () { return undefined; },
    saveScrollIndex: function () { },
    getScrollIndex: function () { return undefined; },
    cleanStaleScrollOffsets: function () { },
};
var ScrollOffsetContext = (0, react_1.createContext)(defaultValue);
exports.ScrollOffsetContext = ScrollOffsetContext;
/** This function is prepared to work with HOME screens. May need modification if we want to handle other types of screens. */
function getKey(route) {
    if (route.params && 'policyID' in route.params && typeof route.params.policyID === 'string') {
        return "".concat(route.name, "-").concat(route.params.policyID);
    }
    return "".concat(route.name, "-global");
}
function ScrollOffsetContextProvider(_a) {
    var children = _a.children;
    var priorityMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { canBeMissing: true })[0];
    var scrollOffsetsRef = (0, react_1.useRef)({});
    var previousPriorityMode = (0, usePrevious_1.default)(priorityMode);
    (0, react_1.useEffect)(function () {
        if (previousPriorityMode === null || previousPriorityMode === priorityMode) {
            return;
        }
        // If the priority mode changes, we need to clear the scroll offsets for the home screens because it affects the size of the elements and scroll positions wouldn't be correct.
        for (var _i = 0, _a = Object.keys(scrollOffsetsRef.current); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.includes(SCREENS_1.default.HOME)) {
                delete scrollOffsetsRef.current[key];
            }
        }
    }, [priorityMode, previousPriorityMode]);
    var saveScrollOffset = (0, react_1.useCallback)(function (route, scrollOffset) {
        scrollOffsetsRef.current[getKey(route)] = scrollOffset;
    }, []);
    var getScrollOffset = (0, react_1.useCallback)(function (route) {
        if (!scrollOffsetsRef.current) {
            return;
        }
        return scrollOffsetsRef.current[getKey(route)];
    }, []);
    var cleanStaleScrollOffsets = (0, react_1.useCallback)(function (state) {
        var sidebarRoutes = state.routes.filter(function (route) { return (0, isNavigatorName_1.isSidebarScreenName)(route.name); });
        var scrollOffsetKeysOfExistingScreens = sidebarRoutes.map(function (route) { return getKey(route); });
        for (var _i = 0, _a = Object.keys(scrollOffsetsRef.current); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!scrollOffsetKeysOfExistingScreens.includes(key)) {
                delete scrollOffsetsRef.current[key];
            }
        }
    }, []);
    var saveScrollIndex = (0, react_1.useCallback)(function (route, scrollIndex) {
        scrollOffsetsRef.current[getKey(route)] = scrollIndex;
    }, []);
    var getScrollIndex = (0, react_1.useCallback)(function (route) {
        if (!scrollOffsetsRef.current) {
            return;
        }
        return scrollOffsetsRef.current[getKey(route)];
    }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        saveScrollOffset: saveScrollOffset,
        getScrollOffset: getScrollOffset,
        cleanStaleScrollOffsets: cleanStaleScrollOffsets,
        saveScrollIndex: saveScrollIndex,
        getScrollIndex: getScrollIndex,
    }); }, [saveScrollOffset, getScrollOffset, cleanStaleScrollOffsets, saveScrollIndex, getScrollIndex]);
    return <ScrollOffsetContext.Provider value={contextValue}>{children}</ScrollOffsetContext.Provider>;
}
exports.default = ScrollOffsetContextProvider;
