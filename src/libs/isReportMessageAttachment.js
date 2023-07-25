import CONST from '../CONST';

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param {Object} reportActionMessage report action's message as text and html
 * @returns {Boolean}
 */
export default function isReportMessageAttachment({text, html}) {
    if (!text || !html) {
        return false;
    }

    const regex = new RegExp(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="(.*)"`, 'i');
    return text === CONST.ATTACHMENT_MESSAGE_TEXT && (!!html.match(regex) || html === CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML);
}
