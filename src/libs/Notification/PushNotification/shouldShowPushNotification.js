import _ from 'underscore';
import * as Report from '../../actions/Report';
import Log from '../../Log';
import * as ReportActionUtils from '../../ReportActionsUtils';

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 * @param {PushPayload} pushPayload
 * @returns {Boolean}
 */
export default function shouldShowPushNotification(pushPayload) {
    Log.info('[PushNotification] push notification received', false, {pushPayload});

    let pushData = pushPayload.extras.payload;

    // The payload is string encoded on Android
    if (_.isString(pushData)) {
        pushData = JSON.parse(pushData);
    }

    if (!pushData.reportID) {
        Log.info('[PushNotification] Not a report action notification. Showing notification');
        return true;
    }

    const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData(pushData.onyxData);
    const shouldShow = Report.shouldShowReportActionNotification(String(pushData.reportID), reportAction, true);
    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
