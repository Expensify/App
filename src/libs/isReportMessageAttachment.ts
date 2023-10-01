import CONST from '../CONST';
import {Message} from '../types/onyx/ReportAction';

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param reportActionMessage report action's message as text, html and translationKey
 */
export default function isReportMessageAttachment({text, html, translationKey}: Message): boolean {
    if (!text || !html) {
        return false;
    }

    if (translationKey && text === CONST.ATTACHMENT_MESSAGE_TEXT) {
        return translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT;
    }

    const regex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');
    return text === CONST.ATTACHMENT_MESSAGE_TEXT && (!!html.match(regex) || html === CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML);
}
