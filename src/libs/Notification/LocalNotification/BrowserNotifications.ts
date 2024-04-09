// Web and desktop implementation only. Do not import for direct use. Use LocalNotification.
import Str from 'expensify-common/lib/str';
import type {ImageSourcePropType} from 'react-native';
import EXPENSIFY_ICON_URL from '@assets/images/expensify-logo-round-clearspace.png';
import * as AppUpdate from '@libs/actions/AppUpdate';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import * as ReportUtils from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';
import focusApp from './focusApp';
import type {LocalNotificationClickHandler, LocalNotificationData} from './types';

const notificationCache: Record<string, Notification> = {};

/**
 * Checks if the user has granted permission to show browser notifications
 */
function canUseBrowserNotifications(): Promise<boolean> {
    return new Promise((resolve) => {
        // They have no browser notifications so we can't use this feature
        if (!window.Notification) {
            resolve(false);
            return;
        }

        // Check if they previously granted or denied us access to send a notification
        const permissionGranted = Notification.permission === 'granted';

        if (permissionGranted || Notification.permission === 'denied') {
            resolve(permissionGranted);
            return;
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
 *
 * @param icon Path to icon
 * @param data extra data to attach to the notification
 */
function push(
    title: string,
    body = '',
    icon: string | ImageSourcePropType = '',
    data: LocalNotificationData = {},
    onClick: LocalNotificationClickHandler = () => {},
    silent = false,
    tag = '',
) {
    canUseBrowserNotifications().then((canUseNotifications) => {
        if (!canUseNotifications) {
            return;
        }

        // We cache these notifications so that we can clear them later
        const notificationID = Str.guid();
        notificationCache[notificationID] = new Notification(title, {
            body,
            icon: String(icon),
            data,
            silent,
            tag,
        });
        notificationCache[notificationID].onclick = () => {
            onClick();
            window.parent.focus();
            window.focus();
            focusApp();
            notificationCache[notificationID].close();
        };
        notificationCache[notificationID].onclose = () => {
            delete notificationCache[notificationID];
        };
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
     * @param usesIcon true if notification uses right circular icon
     */
    pushReportCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, usesIcon = false) {
        let title;
        let body;
        const icon = usesIcon ? EXPENSIFY_ICON_URL : '';

        const isChatRoom = ReportUtils.isChatRoom(report);

        const {person, message} = reportAction;
        const plainTextPerson = person?.map((f) => f.text).join() ?? '';

        // Specifically target the comment part of the message
        const plainTextMessage = message?.find((f) => f?.type === 'COMMENT')?.text ?? '';

        if (isChatRoom) {
            const roomName = ReportUtils.getReportName(report);
            title = roomName;
            body = `${plainTextPerson}: ${plainTextMessage}`;
        } else {
            title = plainTextPerson;
            body = plainTextMessage;
        }

        const data = {
            reportID: report.reportID,
        };

        push(title, body, icon, data, onClick, true);
    },

    pushModifiedExpenseNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, usesIcon = false) {
        const title = reportAction.person?.map((f) => f.text).join(', ') ?? '';
        const body = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);
        const icon = usesIcon ? EXPENSIFY_ICON_URL : '';
        const data = {
            reportID: report.reportID,
        };
        push(title, body, icon, data, onClick);
    },

    /**
     * Create a notification to indicate that an update is available.
     */
    pushUpdateAvailableNotification() {
        push(
            'Update available',
            'A new version of this app is available!',
            '',
            {},
            () => {
                AppUpdate.triggerUpdateAvailable();
            },
            false,
            'UpdateAvailable',
        );
    },

    /**
     * Clears all open notifications where shouldClearNotification returns true
     *
     * @param shouldClearNotification a function that receives notification.data and returns true/false if the notification should be cleared
     */
    clearNotifications(shouldClearNotification: (notificationData: LocalNotificationData) => boolean) {
        Object.values(notificationCache)
            .filter((notification) => shouldClearNotification(notification.data))
            .forEach((notification) => notification.close());
    },
};
