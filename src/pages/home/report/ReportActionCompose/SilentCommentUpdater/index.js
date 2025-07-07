"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var useLocalize_1 = require("@hooks/useLocalize");
var usePrevious_1 = require("@hooks/usePrevious");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * This component doesn't render anything. It runs a side effect to update the comment of a report under certain conditions.
 * It is connected to the actual draft comment in onyx. The comment in onyx might updates multiple times, and we want to avoid
 * re-rendering a UI component for that. That's why the side effect was moved down to a separate component.
 */
function SilentCommentUpdater(_a) {
    var comment = _a.comment, commentRef = _a.commentRef, reportID = _a.reportID, value = _a.value, updateComment = _a.updateComment, isCommentPendingSaved = _a.isCommentPendingSaved;
    var prevCommentProp = (0, usePrevious_1.default)(comment);
    var prevReportId = (0, usePrevious_1.default)(reportID);
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var prevPreferredLocale = (0, usePrevious_1.default)(preferredLocale);
    (0, react_1.useEffect)(function () {
        updateComment(comment !== null && comment !== void 0 ? comment : '');
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We need to run this on mount
    }, []);
    (0, react_1.useEffect)(function () {
        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        var shouldSyncComment = prevCommentProp !== comment && value !== comment && !isCommentPendingSaved.current;
        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && reportID === prevReportId && !shouldSyncComment) {
            return;
        }
        updateComment(comment !== null && comment !== void 0 ? comment : '');
    }, [prevCommentProp, prevPreferredLocale, prevReportId, comment, preferredLocale, reportID, updateComment, value, commentRef, isCommentPendingSaved]);
    return null;
}
SilentCommentUpdater.displayName = 'SilentCommentUpdater';
exports.default = (0, react_native_onyx_1.withOnyx)({
    comment: {
        key: function (_a) {
            var reportID = _a.reportID;
            return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID);
        },
        initialValue: '',
    },
})(SilentCommentUpdater);
