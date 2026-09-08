import EXPENSIFY_ICON_URL from '@assets/images/expensify-logo-round-clearspace.png';

import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider/types';

import * as AppUpdate from '@libs/actions/AppUpdate';
import {convertToFrontendAmountAsInteger, sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import {getForReportAction} from '@libs/ModifiedExpenseMessage';
import NotificationPermission from '@libs/Notification/notificationPermission';
import {format} from '@libs/NumberFormatUtils';
import {getTextFromHtml} from '@libs/ReportActionsUtils';
import {deprecatedGetReportName} from '@libs/ReportNameUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList, Report, ReportAction, ReportAttributesDerivedValue} from '@src/types/onyx';

import type {ImageSourcePropType} from 'react-native';

// Web implementation only. Do not import for direct use. Use LocalNotification.
import {SafeString, Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type {LocalNotificationClickHandler, LocalNotificationData, LocalNotificationModifiedExpensePushParams} from './types';

const notificationCache: Record<string, Notification> = {};

// The browser-notification pipeline is driven by Pusher events outside React, so there is no component to inject the
// currency formatter from CurrencyListContextProvider. Subscribe to the currency list here and mirror the provider's
// implementation instead of relying on CurrencyUtils' module-scope fallback.
let currencyList: CurrencyList = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.CURRENCY_LIST,
    callback: (value) => {
        currencyList = value ?? {};
    },
});
const convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'] = (amountInCents, currencyCode) => {
    const sanitizedCurrency = sanitizeCurrencyCode(currencyCode);
    const decimals = currencyList?.[sanitizedCurrency]?.decimals ?? CONST.DEFAULT_CURRENCY_DECIMALS;
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents ?? 0, decimals);
    return format(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency: sanitizedCurrency,

        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: decimals,
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2,
    });
};

/**
 * Checks if the user has granted permission to show browser notifications, prompting them
 * if they have not yet decided.
 */
function canUseBrowserNotifications(): Promise<boolean> {
    return NotificationPermission.getStatus().then((status) => {
        if (status === 'granted') {
            return true;
        }
        if (status === 'denied') {
            return false;
        }
        return NotificationPermission.request().then((requested) => requested === 'granted');
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
    canUseBrowserNotifications()
        .then((canUseNotifications) => {
            if (!canUseNotifications) {
                return;
            }

            // Some browsers (e.g. Samsung Internet, Chrome on Android) forbid constructing a Notification in the page
            // context and throw a "TypeError: Illegal constructor". Guard the construction so an unsupported browser
            // degrades to "no local notification" instead of surfacing an unhandled promise rejection.
            let notification: Notification;
            try {
                notification = new Notification(title, {
                    body,
                    icon: SafeString(icon),
                    data,
                    silent: true,
                    tag,
                });
            } catch (error) {
                Log.hmmm('[BrowserNotifications] Failed to construct a Notification', {error});
                return;
            }

            // We cache these notifications so that we can clear them later
            const notificationID = Str.guid();
            notificationCache[notificationID] = notification;
            if (!silent) {
                playSound(SOUNDS.RECEIVE);
            }
            notification.onclick = () => {
                onClick();
                window.parent.focus();
                window.focus();
                notification.close();
            };
            notification.onclose = () => {
                delete notificationCache[notificationID];
            };
        })
        .catch((error) => {
            // Swallow any unexpected errors from the permission check or notification setup so they don't surface as
            // unhandled promise rejections (the root cause of the reported crash).
            Log.hmmm('[BrowserNotifications] Failed to push a local notification', {error});
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
    pushReportCommentNotification(
        report: Report,
        reportAction: ReportAction,
        onClick: LocalNotificationClickHandler,
        usesIcon = false,
        reportAttributes?: ReportAttributesDerivedValue['reports'],
    ) {
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
            const roomName = deprecatedGetReportName(report, reportAttributes);
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

    pushModifiedExpenseNotification({
        report,
        reportAction,
        movedFromReport,
        movedToReport,
        onClick,
        usesIcon = false,
        policyTags,
        policy,
        currentUserLogin,
        reportAttributes,
    }: LocalNotificationModifiedExpensePushParams) {
        const title = reportAction.person?.map((f) => f.text).join(', ') ?? '';
        const bodyWithHTML = getForReportAction({
            translate: translateLocal,
            convertToDisplayString,
            reportAction,
            policy,
            movedFromReport,
            movedToReport,
            policyTags,
            currentUserLogin,
            reportAttributes,
        });
        // Strip HTML tags for plain text notification body
        const body = getTextFromHtml(bodyWithHTML);
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
