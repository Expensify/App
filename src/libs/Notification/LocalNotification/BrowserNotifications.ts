// Web implementation only. Do not import for direct use. Use LocalNotification.
import {Str} from 'expensify-common';
import type {ImageSourcePropType} from 'react-native';
import EXPENSIFY_ICON_URL from '@assets/images/expensify-logo-round-clearspace.png';
import * as AppUpdate from '@libs/actions/AppUpdate';
import {getForReportAction} from '@libs/ModifiedExpenseMessage';
import {getTextFromHtml} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import type {Report, ReportAction} from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';
import type {LocalNotificationClickHandler, LocalNotificationData, LocalNotificationModifiedExpensePushParams} from './types';

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
            icon: SafeString(icon),
            data,
            silent: true,
            tag,
        });
        if (!silent) {
            playSound(SOUNDS.RECEIVE);
        }
        notificationCache[notificationID].onclick = () => {
            onClick();
            window.parent.focus();
            window.focus();
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

        const isRoomOrGroupChat = ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isGroupChat(report);

        const {person, message} = reportAction;
        const plainTextPerson = person?.map((f) => Str.removeSMSDomain(f.text ?? '')).join() ?? '';

        // Specifically target the comment part of the message
        let plainTextMessage = '';
        if (Array.isArray(message)) {
            plainTextMessage = getTextFromHtml(message?.find((f) => f?.type === 'COMMENT')?.html);
        } else {
            plainTextMessage = message?.type === 'COMMENT' ? getTextFromHtml(message?.html) : '';
        }

        if (isRoomOrGroupChat) {
            // Will be fixed in https://github.com/Expensify/App/issues/76852
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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

        push(title, body, icon, data, onClick);
    },

    pushModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, usesIcon = false}: LocalNotificationModifiedExpensePushParams) {
        const title = reportAction.person?.map((f) => f.text).join(', ') ?? '';
        const body = getForReportAction({
            reportAction,
            policyID: report.policyID,
            movedFromReport,
            movedToReport,
        });
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
        for (const notification of Object.values(notificationCache)) {
            if (!shouldClearNotification(notification.data as LocalNotificationData)) {
                continue;
            }
            notification.close();
        }
    },
};
