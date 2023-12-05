// Web and desktop implementation only. Do not import for direct use. Use LocalNotification.
import EXPENSIFY_ICON_URL from '@assets/images/expensify-logo-round-clearspace.png';
import * as ReportUtils from '@libs/ReportUtils';
import * as AppUpdate from '@userActions/AppUpdate';
import focusApp from './focusApp';
import {PushParams, ReportCommentParams} from './types';

const DEFAULT_DELAY = 4000;

/**
 * Checks if the user has granted permission to show browser notifications
 */
function canUseBrowserNotifications(): Promise<boolean> {
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
        Notification.requestPermission().then((status) => {
            resolve(status === 'granted');
        });
    });
}

/**
 * Light abstraction around browser push notifications.
 * Checks for permission before determining whether to send.
 * @return resolves with Notification object or undefined
 */
function push({title, body, delay = DEFAULT_DELAY, onClick = () => {}, tag = '', icon}: PushParams): Promise<void | Notification> {
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
                tag,
                icon: String(icon),
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
     * @param usesIcon true if notification uses right circular icon
     */
    pushReportCommentNotification({report, reportAction, onClick}: ReportCommentParams, usesIcon = false) {
        let title: string | undefined;
        let body: string | undefined;

        const isChatRoom = ReportUtils.isChatRoom(report);

        const {person, message} = reportAction;
        const plainTextPerson = person?.map((f) => f.text).join();

        // Specifically target the comment part of the message
        const plainTextMessage = message?.find((f) => f.type === 'COMMENT')?.text;

        if (isChatRoom) {
            const roomName = ReportUtils.getReportName(report);
            title = roomName;
            body = `${plainTextPerson}: ${plainTextMessage}`;
        } else {
            title = plainTextPerson;
            body = plainTextMessage;
        }

        push({
            title: title ?? '',
            body,
            delay: 0,
            onClick,
            icon: usesIcon ? EXPENSIFY_ICON_URL : '',
        });
    },

    pushModifiedExpenseNotification({reportAction, onClick}: ReportCommentParams, usesIcon = false) {
        push({
            title: reportAction.person?.map((f) => f.text).join(', ') ?? '',
            body: ReportUtils.getModifiedExpenseMessage(reportAction),
            delay: 0,
            onClick,
            icon: usesIcon ? EXPENSIFY_ICON_URL : '',
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
                AppUpdate.triggerUpdateAvailable();
            },
        });
    },
};
