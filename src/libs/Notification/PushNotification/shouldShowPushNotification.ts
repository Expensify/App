/* eslint-disable prettier/prettier */
import type {PushPayloadOverride} from '@ua/react-native-airship';
import Log from '@libs/Log';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import type { PushNotificationData } from './NotificationType';

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
export default function shouldShowPushNotification(pushPayload: PushPayloadOverride): boolean {
    Log.info('[PushNotification] push notification received', false, {pushPayload});

    let payload = pushPayload.extras?.payload;

    // The payload is string encoded on Android
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload) as PushNotificationData;
        } catch {
            Log.hmmm(`[PushNotification] Failed to parse the payload`, payload);
        }
    }

    if (!payload || !(payload as PushNotificationData)?.reportID) {
        Log.info('[PushNotification] Not a report action notification. Showing notification');
        return true;
    }

    const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData((payload as PushNotificationData).onyxData ?? null);
    const shouldShow = Report.shouldShowReportActionNotification(String((payload as PushNotificationData).reportID), reportAction, true);
    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
