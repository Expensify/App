import LocalNotificationService from './LocalNotificationService';
import NotificationGenerator from './NotificationGenerator';

/**
 * Send a report comment notification.
 *
 * @param {Object} params
 * @param {Object} params.reportAction
 * @param {Function} params.onPress
 */
function showCommentNotification({reportAction, onPress}) {
    const commentNotification = NotificationGenerator.getReportCommentNotificationPayload(reportAction, onPress);
    LocalNotificationService.queueNotification(commentNotification);
}

/**
 * Send an update available notification.
 */
function showUpdateAvailableNotification() {
    const updateAvailableNotification = NotificationGenerator.getUpdateAvailableNotification();
    LocalNotificationService.queueNotification(updateAvailableNotification);
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
};
