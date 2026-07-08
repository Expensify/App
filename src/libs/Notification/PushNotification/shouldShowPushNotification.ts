import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getIsOffline} from '@libs/NetworkState';
import * as ReportActionUtils from '@libs/ReportActionsUtils';

import * as Report from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report as ReportType, ReportActions} from '@src/types/onyx';

import type {PushPayload} from '@ua/react-native-airship';
import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import parsePushNotificationPayload from './parsePushNotificationPayload';

// Push notifications aren't rendered using React, so it's impossible to access Onyx data with useOnyx(), therefore, it's OK to use connectWithoutView() here.

let currentUserAccountID = -1;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<ReportType>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => (allReports = value),
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
        const topmostReportID = Navigation.getTopmostReportId();
        const topmostReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${topmostReportID}`];
        const topmostChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${topmostReport?.chatReportID}`];
        const topmostReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${topmostReportID}`];
        const topmostOneTransactionThreadReportID = ReportActionUtils.getOneTransactionThreadReportID(topmostReport, topmostChatReport, topmostReportActions, getIsOffline());
        shouldShow = Report.shouldShowReportActionNotification(String(data.reportID), topmostOneTransactionThreadReportID, currentUserAccountID, reportAction, true);
    }

    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}
