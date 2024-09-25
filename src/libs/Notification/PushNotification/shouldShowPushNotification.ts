import type {PushPayload} from '@ua/react-native-airship';
import Log from '@libs/Log';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import parsePushNotificationPayload from './parsePushNotificationPayload';

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
export default function shouldShowPushNotification(pushPayload: PushPayload): boolean {
    Log.info('[PushNotification] push notification received', false, {pushPayload});
    const data = parsePushNotificationPayload(pushPayload.extras.payload);

    if (data?.reportID === undefined) {
        Log.info('[PushNotification] Not a report action notification. Showing notification');
        return true;
    }

    const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData(data.onyxData ?? null);
    const shouldShow = Report.shouldShowReportActionNotification(String(data.reportID), reportAction, true);
    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
