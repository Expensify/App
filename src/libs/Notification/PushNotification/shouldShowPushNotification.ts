import {PushPayload} from '@ua/react-native-airship';
import {OnyxUpdate} from 'react-native-onyx';
import Log from '@libs/Log';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';

type PushData = {
    onyxData: OnyxUpdate[];
    reportID?: number;
};

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
export default function shouldShowPushNotification(pushPayload: PushPayload): boolean {
    Log.info('[PushNotification] push notification received', false, {pushPayload});

    let payload = pushPayload.extras.payload;

    // The payload is string encoded on Android
    if (typeof payload === 'string') {
        payload = JSON.parse(payload);
    }

    const pushData = payload as PushData;

    if (!pushData.reportID) {
        Log.info('[PushNotification] Not a report action notification. Showing notification');
        return true;
    }

    const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData(pushData.onyxData);
    const shouldShow = Report.shouldShowReportActionNotification(String(pushData.reportID), reportAction, true);
    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
