import LocalNotificationService from './LocalNotificationService';
import NotificationGenerator from './NotificationGenerator';
import commonNotifications from './common';

/**
 * Send an update available notification.
 */
function showUpdateAvailableNotification() {
    const updateAvailableNotification = NotificationGenerator.getUpdateAvailableNotification();
    LocalNotificationService.queueNotification(updateAvailableNotification);
}

export default {
    ...commonNotifications,
    showUpdateAvailableNotification,
};
