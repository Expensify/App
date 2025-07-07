"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportScreenContext_1 = require("@pages/home/ReportScreenContext");
function useReportScrollManager() {
    var _a = (0, react_1.useContext)(ReportScreenContext_1.ActionListContext), flatListRef = _a.flatListRef, setScrollPosition = _a.setScrollPosition;
    /**
     * Scroll to the provided index.
     */
    var scrollToIndex = (0, react_1.useCallback)(function (index) {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        flatListRef.current.scrollToIndex({ index: index });
    }, [flatListRef]);
    /**
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    var scrollToBottom = (0, react_1.useCallback)(function () {
        var _a;
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        setScrollPosition({ offset: 0 });
        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ animated: false, offset: 0 });
    }, [flatListRef, setScrollPosition]);
    /**
     * Scroll to the end of the FlatList.
     */
    var scrollToEnd = (0, react_1.useCallback)(function () {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        var scrollViewRef = flatListRef.current.getNativeScrollRef();
        // Try to scroll on underlying scrollView if available, fallback to usual listRef
        if (scrollViewRef && 'scrollToEnd' in scrollViewRef) {
            scrollViewRef.scrollToEnd({ animated: false });
            return;
        }
        flatListRef.current.scrollToEnd({ animated: false });
    }, [flatListRef]);
    var scrollToOffset = (0, react_1.useCallback)(function (offset) {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        flatListRef.current.scrollToOffset({ offset: offset, animated: false });
    }, [flatListRef]);
    return { ref: flatListRef, scrollToIndex: scrollToIndex, scrollToBottom: scrollToBottom, scrollToEnd: scrollToEnd, scrollToOffset: scrollToOffset };
}
exports.default = useReportScrollManager;
