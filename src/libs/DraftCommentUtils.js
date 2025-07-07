"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDraftComment = getDraftComment;
exports.isValidDraftComment = isValidDraftComment;
exports.hasValidDraftComment = hasValidDraftComment;
exports.prepareDraftComment = prepareDraftComment;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var draftCommentCollection = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT,
    callback: function (nextVal) {
        draftCommentCollection = nextVal;
    },
    waitForCollectionCallback: true,
});
/**
 * Returns a draft comment from the onyx collection for given reportID.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use-case of this function is outside React components, like in utility functions.
 */
function getDraftComment(reportID) {
    return draftCommentCollection === null || draftCommentCollection === void 0 ? void 0 : draftCommentCollection[ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT + reportID];
}
/**
 * Returns true if the report has a valid draft comment.
 * A valid draft comment is a non-empty string.
 */
function isValidDraftComment(comment) {
    return !!comment;
}
/**
 * Returns true if the report has a valid draft comment.
 */
function hasValidDraftComment(reportID) {
    return isValidDraftComment(getDraftComment(reportID));
}
/**
 * Prepares a draft comment by returning null if it's empty.
 */
function prepareDraftComment(comment) {
    // logical OR is used to convert empty string to null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return comment || null;
}
