import LocalNotificationService from './LocalNotificationService';
import NotificationGenerator from './NotificationGenerator';

/**
 * Create a report comment notification
 *
 * @param {Object} params
 * @param {Object} params.reportAction
 * @param {Function} params.onPress
 * @throws {Error}
 */
function showCommentNotification({reportAction, onPress}) {
    const commentNotification = NotificationGenerator.getReportCommentNotificationPayload(reportAction, onPress);
    LocalNotificationService.queueNotification(commentNotification);
}

export default {
    showCommentNotification: () => {},
};
