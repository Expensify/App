"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var htmlparser2_1 = require("htmlparser2");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var CONST_1 = require("@src/CONST");
/**
 * Constructs the initial component state from report actions
 */
function extractAttachments(type, _a) {
    var _b, _c, _d;
    var privateNotes = _a.privateNotes, accountID = _a.accountID, parentReportAction = _a.parentReportAction, reportActions = _a.reportActions, report = _a.report;
    var targetNote = (_c = (_b = privateNotes === null || privateNotes === void 0 ? void 0 : privateNotes[Number(accountID)]) === null || _b === void 0 ? void 0 : _b.note) !== null && _c !== void 0 ? _c : '';
    var description = (_d = report === null || report === void 0 ? void 0 : report.description) !== null && _d !== void 0 ? _d : '';
    var attachments = [];
    var canUserPerformAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    var currentLink = '';
    var htmlParser = new htmlparser2_1.Parser({
        onopentag: function (name, attribs) {
            var _a;
            if (name === 'a' && attribs.href) {
                currentLink = attribs.href;
            }
            if (name === 'video') {
                var source = (0, tryResolveUrlFromApiRoot_1.default)(attribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE]);
                var fileName = attribs[CONST_1.default.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || (0, FileUtils_1.getFileName)("".concat(source));
                attachments.unshift({
                    reportActionID: attribs['data-id'],
                    attachmentID: attribs[CONST_1.default.ATTACHMENT_ID_ATTRIBUTE],
                    source: (0, tryResolveUrlFromApiRoot_1.default)(attribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE]),
                    isAuthTokenRequired: !!attribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE],
                    file: { name: fileName },
                    duration: Number(attribs[CONST_1.default.ATTACHMENT_DURATION_ATTRIBUTE]),
                    isReceipt: false,
                    hasBeenFlagged: attribs['data-flagged'] === 'true',
                });
                return;
            }
            if (name === 'img' && attribs.src) {
                var expensifySource = (_a = attribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE]) !== null && _a !== void 0 ? _a : (new RegExp(CONST_1.default.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i').test(attribs.src) ? attribs.src : null);
                var source = (0, tryResolveUrlFromApiRoot_1.default)(expensifySource || attribs.src);
                var previewSource = (0, tryResolveUrlFromApiRoot_1.default)(attribs.src);
                var fileName = attribs[CONST_1.default.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || (0, FileUtils_1.getFileName)("".concat(source));
                var width = (attribs['data-expensify-width'] && parseInt(attribs['data-expensify-width'], 10)) || undefined;
                var height = (attribs['data-expensify-height'] && parseInt(attribs['data-expensify-height'], 10)) || undefined;
                // Public image URLs might lack a file extension in the source URL, without an extension our
                // AttachmentView fails to recognize them as images and renders fallback content instead.
                // We apply this small hack to add an image extension and ensure AttachmentView renders the image.
                var fileInfo = (0, FileUtils_1.splitExtensionFromFileName)(fileName);
                if (!fileInfo.fileExtension) {
                    fileName = "".concat(fileInfo.fileName || 'image', ".jpg");
                }
                // By iterating actions in chronological order and prepending each attachment
                // we ensure correct order of attachments even across actions with multiple attachments.
                attachments.unshift({
                    reportActionID: attribs['data-id'],
                    attachmentID: attribs[CONST_1.default.ATTACHMENT_ID_ATTRIBUTE],
                    source: source,
                    previewSource: previewSource,
                    isAuthTokenRequired: !!expensifySource,
                    file: { name: fileName, width: width, height: height },
                    isReceipt: false,
                    hasBeenFlagged: attribs['data-flagged'] === 'true',
                    attachmentLink: currentLink,
                });
            }
        },
        onclosetag: function (name) {
            if (name !== 'a' || !currentLink) {
                return;
            }
            currentLink = '';
        },
    });
    if (type === CONST_1.default.ATTACHMENT_TYPE.NOTE) {
        htmlParser.write(targetNote);
        htmlParser.end();
        return attachments.reverse();
    }
    if (type === CONST_1.default.ATTACHMENT_TYPE.ONBOARDING) {
        htmlParser.write(description);
        htmlParser.end();
        return attachments.reverse();
    }
    var actions = __spreadArray(__spreadArray([], (parentReportAction ? [parentReportAction] : []), true), (0, ReportActionsUtils_1.getSortedReportActions)(Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})), true);
    actions.forEach(function (action, key) {
        var _a, _b;
        if (!(0, ReportActionsUtils_1.shouldReportActionBeVisible)(action, key, canUserPerformAction) || (0, ReportActionsUtils_1.isMoneyRequestAction)(action)) {
            return;
        }
        var decision = (_b = (_a = (0, ReportActionsUtils_1.getReportActionMessage)(action)) === null || _a === void 0 ? void 0 : _a.moderationDecision) === null || _b === void 0 ? void 0 : _b.decision;
        var hasBeenFlagged = decision === CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_HIDE || decision === CONST_1.default.MODERATION.MODERATOR_DECISION_HIDDEN;
        var html = (0, ReportActionsUtils_1.getReportActionHtml)(action)
            .replaceAll('/>', "data-flagged=\"".concat(hasBeenFlagged, "\" data-id=\"").concat(action.reportActionID, "\"/>"))
            .replaceAll('<video ', "<video data-flagged=\"".concat(hasBeenFlagged, "\" data-id=\"").concat(action.reportActionID, "\" "));
        htmlParser.write((0, ReportActionsUtils_1.getHtmlWithAttachmentID)(html, action.reportActionID));
    });
    htmlParser.end();
    return attachments.reverse();
}
exports.default = extractAttachments;
