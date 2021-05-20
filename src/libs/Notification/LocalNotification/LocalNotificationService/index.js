import LocalNotification from '../LocalNotification';
import focusApp from '../focusApp';

/**
 * Checks if the user has granted permission to show browser notifications
 *
 * @return {Promise}
 */
function canUseBrowserNotifications() {
    return new Promise((resolve) => {
        // They have no browser notifications so we can't use this feature
        if (!window.Notification) {
            return resolve(false);
        }

        // Check if they previously granted or denied us access to send a notification
        const permissionGranted = Notification.permission === 'granted';

        if (permissionGranted || Notification.permission === 'denied') {
            return resolve(permissionGranted);
        }

        // Check their global preferences for browser notifications and ask permission if they have none
        Notification.requestPermission()
            .then((status) => {
                resolve(status === 'granted');
            });
    });
}

/**
 * Light abstraction around browser push notifications.
 * Checks for permission before determining whether to send.
 *
 * @param {LocalNotification} notification
 */
function queueNotification(notification) {
    if (!(notification instanceof LocalNotification)) {
        throw new Error('Attempting to queue invalid LocalNotification');
    }

    canUseBrowserNotifications().then((canUseNotifications) => {
        if (!canUseNotifications) {
            return;
        }

        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: notification.icon,
            tag: notification.tag,
        });

        // If we pass in a delay param greater than 0 the notification
        // will auto-close after the specified time.
        if (notification.hideAfter > 0) {
            setTimeout(browserNotification.close.bind(browserNotification), notification.hideAfter);
        }

        browserNotification.onclick = (event) => {
            event.preventDefault();
            notification.onPress();
            window.parent.focus();
            window.focus();
            focusApp();
            browserNotification.close();
        };
    });
}

export default {
    queueNotification,
};
