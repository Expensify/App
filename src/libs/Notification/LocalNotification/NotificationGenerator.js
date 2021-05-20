import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import LocalNotification from './LocalNotification';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * Process a reportAction to get a notification payload.
 *
 * @param {Object} reportAction
 * @param {Function} onPress
 * @returns {LocalNotification}
 */
function getReportCommentNotificationPayload(reportAction, onPress) {
    const {person, message} = reportAction;
    const plainTextPerson = Str.htmlDecode(person.map(f => f.text).join());

    // Specifically target the comment part of the message
    const plainTextMessage = Str.htmlDecode((message.find(f => f.type === 'COMMENT') || {}).text);

    return new LocalNotification(`New message from ${plainTextPerson}`, plainTextMessage, onPress);
}

/**
 * Generate the update available notification.
 *
 * @returns {LocalNotification}
 */
function getUpdateAvailableNotification() {
    return new LocalNotification(
        'Update available',
        'A new version of Expensify.cash is available!',
        0,
        () => {
            Onyx.merge(ONYXKEYS.UPDATE_AVAILABLE, true);
        },
    );
}

export default {
    getReportCommentNotificationPayload,
    getUpdateAvailableNotification,
};
