import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';
import Parser from './Parser';
import StringUtils from './StringUtils';

const attachmentRegex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');
const attachmentElementRegex = new RegExp(
    `<img[^>]* ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="[^"]*"[^>]*\/?>|<(?:a|video)[^>]* ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="[^"]*"[^>]*>[\\s\\S]*?<\/(?:a|video)>`,
    'gi',
);

function isReportMessageWithAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    if (message.translationKey) {
        return message.text === CONST.ATTACHMENT_MESSAGE_TEXT && message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT;
    }

    return attachmentRegex.test(message.html);
}

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param message report action's message as text, html and translationKey
 */
function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message || !isReportMessageWithAttachment(message)) {
        return false;
    }

    const isAttachmentMessageText = message.text === CONST.ATTACHMENT_MESSAGE_TEXT;

    if (isAttachmentMessageText) {
        return true;
    }

    return Str.isVideo(message.text);
}

/**
 * Check whether a report message contains only attachment content and no authored text.
 */
function isAttachmentOnlyMessage(message: Message | undefined): boolean {
    if (!isReportMessageWithAttachment(message)) {
        return false;
    }

    if (message?.translationKey) {
        return message.text === CONST.ATTACHMENT_MESSAGE_TEXT && message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT;
    }

    const messageHTML = message?.html ?? '';
    const htmlWithoutAttachmentElements = messageHTML.replaceAll(attachmentElementRegex, '');
    return StringUtils.normalize(Parser.htmlToText(htmlWithoutAttachmentElements)) === '';
}

export {isAttachmentOnlyMessage, isReportMessageAttachment, isReportMessageWithAttachment};
