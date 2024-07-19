import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const attachmentRegex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param reportActionMessage report action's message as text, html and translationKey
 */
export default function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    if (message.translationKey) {
        return message.text === CONST.ATTACHMENT_MESSAGE_TEXT && message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT;
    }

    const isAttachmentMessageText = message.text === CONST.ATTACHMENT_MESSAGE_TEXT;
    const isVideoText = Str.isVideo(message.text);
    const hasAttachmentHtml = attachmentRegex.test(message.html) || message.html === CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML;

    return (isAttachmentMessageText || isVideoText) && hasAttachmentHtml;
}
