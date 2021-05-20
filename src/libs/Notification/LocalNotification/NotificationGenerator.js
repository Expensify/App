import Str from 'expensify-common/lib/str';

/**
 * Process a reportAction to get a notification payload.
 *
 * @param {Object} reportAction
 * @returns {Object}
 */
function getReportCommentNotificationPayload(reportAction) {
    const {person, message} = reportAction;
    const plainTextPerson = Str.htmlDecode(person.map(f => f.text).join());

    // Specifically target the comment part of the message
    const plainTextMessage = Str.htmlDecode((message.find(f => f.type === 'COMMENT') || {}).text);

    return {
        title: `New message from ${plainTextPerson}`,
        message: plainTextMessage,
    };
}

export default {
    getReportCommentNotificationPayload,
};
