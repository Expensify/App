"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Adding .android component to disable updating comment when prev comment is different
 * it fixes issue on Android, assuming we don't need tab sync on mobiles - https://github.com/Expensify/App/issues/28562
 */
/**
 * This component doesn't render anything. It runs a side effect to update the comment of a report under certain conditions.
 * It is connected to the actual draft comment in onyx. The comment in onyx might updates multiple times, and we want to avoid
 * re-rendering a UI component for that. That's why the side effect was moved down to a separate component.
 */
function SilentCommentUpdater(_a) {
    var comment = _a.comment, updateComment = _a.updateComment;
    (0, react_1.useEffect)(function () {
        updateComment(comment !== null && comment !== void 0 ? comment : '');
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We need to run this on mount
    }, []);
    return null;
}
SilentCommentUpdater.displayName = 'SilentCommentUpdater';
exports.default = (0, react_native_onyx_1.withOnyx)({
    comment: {
        key: function (_a) {
            var reportID = _a.reportID;
            return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID);
        },
    },
})(SilentCommentUpdater);
