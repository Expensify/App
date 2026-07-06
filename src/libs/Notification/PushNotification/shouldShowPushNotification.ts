import Log from '@libs/Log';
import * as ReportActionUtils from '@libs/ReportActionsUtils';

import * as Report from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {PushPayload} from '@ua/react-native-airship';
import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import parsePushNotificationPayload from './parsePushNotificationPayload';

// We do not depend on updates on the UI for notifications, so we can use `connectWithoutView` here.
let currentUserAccountID = -1;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

// We do not depend on updates on the UI for notifications, so we can use `connectWithoutView` here.
let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
export default function shouldShowPushNotification(pushPayload: PushPayload): boolean {
    Log.info('[PushNotification] push notification received', false, {pushPayload});
    const data = parsePushNotificationPayload(pushPayload.extras.payload);

    if (!data) {
        return true;
    }

    let shouldShow = false;
    if (data.type === 'transaction') {
        shouldShow = true;
    } else {
        const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData(data.onyxData ?? null);
        shouldShow = Report.shouldShowReportActionNotification(String(data.reportID), allReportActions, currentUserAccountID, reportAction, true);
    }

    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
