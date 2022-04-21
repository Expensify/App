// Web and desktop implementation only. Do not import for direct use. Use LocalNotification.
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import focusApp from './focusApp';
import EXPENSIFY_ICON_URL from '../../../../assets/images/expensify-logo-round-clearspace.png';
import * as App from '../../actions/App';

const DEFAULT_DELAY = 4000;

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
 * @param {Object} params
 * @param {String} params.title
 * @param {String} params.body
 * @param {String} [params.icon] Default to Expensify logo
 * @param {Number} [params.delay]
 * @param {Function} [params.onClick]
 * @param {String} [params.tag]
 *
 * @return {Promise} - resolves with Notification object or undefined
 */
function push({
    title,
    body,
    delay = DEFAULT_DELAY,
    onClick = () => {},
    tag = '',
    icon = EXPENSIFY_ICON_URL,
}) {
    return new Promise((resolve) => {
        if (!title || !body) {
            throw new Error('BrowserNotification must include title and body parameter.');
        }

        canUseBrowserNotifications().then((canUseNotifications) => {
            if (!canUseNotifications) {
                resolve();
                return;
            }

            const notification = new Notification(title, {
                body,
                icon,
                tag,
            });

            // If we pass in a delay param greater than 0 the notification
            // will auto-close after the specified time.
            if (delay > 0) {
                setTimeout(notification.close.bind(notification), delay);
            }

            notification.onclick = () => {
                onClick();
                window.parent.focus();
                window.focus();
                focusApp();
                notification.close();
            };

            resolve(notification);
        });
    });
}

/**
 * BrowserNotification
 * @namespace
 */
export default {
    /**
     * Create a report comment notification
     *
     * @param {Object} params
     * @param {Object} params.reportAction
     * @param {Function} params.onClick
     */
    pushReportCommentNotification({reportAction, onClick}) {
        const {person, message} = reportAction;
        const plainTextPerson = Str.htmlDecode(_.map(person, f => f.text).join());

        // Specifically target the comment part of the message
        const plainTextMessage = Str.htmlDecode((_.find(message, f => f.type === 'COMMENT') || {}).text);

        push({
            title: plainTextPerson,
            body: plainTextMessage,
            delay: 0,
            onClick,
        });
    },

    /**
     * Create a notification to indicate that an update is available.
     */
    pushUpdateAvailableNotification() {
        push({
            title: 'Update available',
            body: 'A new version of this app is available!',
            delay: 0,
            onClick: () => {
                App.triggerUpdateAvailable();
            },
        });
    },
};
