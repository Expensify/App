import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const attachmentRegex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');
const attachmentOnlyHtmlRegex = /^\s*<(?:img|a|video)\s/i;

/**
 * Returns true for attachment-only messages (no user-typed text), false for attachment+text and non-attachment messages.
 */
function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    // Optimistic attachment-only messages carry this translationKey; the server drops it after sync.
    if (message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT) {
        return true;
    }

    if (!attachmentRegex.test(message.html)) {
        return false;
    }

    // Attachment-only HTML starts with the attachment tag; attachment+text has user content before it.
    return attachmentOnlyHtmlRegex.test(message.html);
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
