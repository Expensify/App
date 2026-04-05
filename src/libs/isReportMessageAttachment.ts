import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const attachmentRegex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');
const originalFilenameRegex = new RegExp(` ${CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE}="([^"]*)"`, 'i');

/**
 * Check whether a report action is Attachment-only or not.
 * Returns true only for attachment-only messages (no user text beyond the attachment).
 * Returns false for attachment+text messages so that the text is displayed normally.
 *
 * @param message report action's message as text, html and translationKey
 */
function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    // translationKey is set only for attachment-only optimistic messages, so trust it as the authoritative signal
    if (message.translationKey && message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT) {
        return true;
    }

    const hasAttachmentHtml = attachmentRegex.test(message.html);

    if (!hasAttachmentHtml) {
        return false;
    }

    if (message.text === CONST.ATTACHMENT_MESSAGE_TEXT) {
        return true;
    }

    if (Str.isVideo(message.text)) {
        return true;
    }

    // For document attachments (.docx, .pdf, etc.), message.text contains the filename followed by the URL
    // (e.g., "Sample.docx https://staging.expensify.com/chat-attachments/...").
    // Check if the text starts with the original filename attribute — if so, it's attachment-only.
    const filenameMatch = message.html.match(originalFilenameRegex);
    if (filenameMatch && message.text.startsWith(filenameMatch[1])) {
        return true;
    }

    return false;
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
