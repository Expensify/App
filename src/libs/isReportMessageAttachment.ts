import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const ATTACHMENT_PATTERN = new RegExp(`\\s${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}=".*"`, 'i');

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param message report action's message as text, html and translationKey
 */
export default function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    if (message.translationKey && message.text === CONST.ATTACHMENT_MESSAGE_TEXT) {
        return message?.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT;
    }

    return ATTACHMENT_PATTERN.test(message.html);
}
