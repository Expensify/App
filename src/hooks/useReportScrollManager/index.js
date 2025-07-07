"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportScreenContext_1 = require("@pages/home/ReportScreenContext");
function useReportScrollManager() {
    var flatListRef = (0, react_1.useContext)(ReportScreenContext_1.ActionListContext).flatListRef;
    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     */
    var scrollToIndex = (0, react_1.useCallback)(function (index, isEditing) {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current) || isEditing) {
            return;
        }
        flatListRef.current.scrollToIndex({ index: index, animated: true });
    }, [flatListRef]);
    /**
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    var scrollToBottom = (0, react_1.useCallback)(function () {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }, [flatListRef]);
    /**
     * Scroll to the end of the FlatList.
     */
    var scrollToEnd = (0, react_1.useCallback)(function () {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        flatListRef.current.scrollToEnd({ animated: false });
    }, [flatListRef]);
    var scrollToOffset = (0, react_1.useCallback)(function (offset) {
        if (!(flatListRef === null || flatListRef === void 0 ? void 0 : flatListRef.current)) {
            return;
        }
        flatListRef.current.scrollToOffset({ animated: true, offset: offset });
    }, [flatListRef]);
    return { ref: flatListRef, scrollToIndex: scrollToIndex, scrollToBottom: scrollToBottom, scrollToEnd: scrollToEnd, scrollToOffset: scrollToOffset };
}
exports.default = useReportScrollManager;
