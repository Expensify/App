"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportMessageAttachment = isReportMessageAttachment;
var expensify_common_1 = require("expensify-common");
var CONST_1 = require("@src/CONST");
var attachmentRegex = new RegExp(" ".concat(CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE, "=\"(.*)\""), 'i');
/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param message report action's message as text, html and translationKey
 */
function isReportMessageAttachment(message) {
    if (!(message === null || message === void 0 ? void 0 : message.text) || !message.html) {
        return false;
    }
    if (message.translationKey) {
        return message.text === CONST_1.default.ATTACHMENT_MESSAGE_TEXT && message.translationKey === CONST_1.default.TRANSLATION_KEYS.ATTACHMENT;
    }
    var hasAttachmentHtml = attachmentRegex.test(message.html);
    if (!hasAttachmentHtml) {
        return false;
    }
    var isAttachmentMessageText = message.text === CONST_1.default.ATTACHMENT_MESSAGE_TEXT;
    if (isAttachmentMessageText) {
        return true;
    }
    return expensify_common_1.Str.isVideo(message.text);
}
