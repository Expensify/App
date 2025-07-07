"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useReportUnreadMessageScrollTracking;
var react_1 = require("react");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
function useReportUnreadMessageScrollTracking(_a) {
    var reportID = _a.reportID, currentVerticalScrollingOffsetRef = _a.currentVerticalScrollingOffsetRef, floatingMessageVisibleInitialValue = _a.floatingMessageVisibleInitialValue, hasUnreadMarkerReportAction = _a.hasUnreadMarkerReportAction, readActionSkippedRef = _a.readActionSkippedRef, onTrackScrolling = _a.onTrackScrolling;
    var _b = (0, react_1.useState)(floatingMessageVisibleInitialValue), isFloatingMessageCounterVisible = _b[0], setIsFloatingMessageCounterVisible = _b[1];
    /**
     * On every scroll event we want to:
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */
    var trackVerticalScrolling = function (event) {
        onTrackScrolling(event);
        // display floating button if we're scrolled more than the offset
        if (currentVerticalScrollingOffsetRef.current > CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(true);
        }
        // hide floating button if we're scrolled closer than the offset and mark message as read
        if (currentVerticalScrollingOffsetRef.current < CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkippedRef.current) {
                // eslint-disable-next-line react-compiler/react-compiler,no-param-reassign
                readActionSkippedRef.current = false;
                (0, Report_1.readNewestAction)(reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };
    return {
        isFloatingMessageCounterVisible: isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible: setIsFloatingMessageCounterVisible,
        trackVerticalScrolling: trackVerticalScrolling,
    };
}
