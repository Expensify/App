import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import updateUnread from './updateUnread/index';

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        const unreadReports = _.filter(
            reportsFromOnyx,
            (report) =>
                ReportUtils.isUnread(report) &&
                // Reports that are archived or have a hidden preference are technically "unread", but should not be counted by the global indicator
                report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN &&
                !ReportUtils.isArchivedRoom(report),
        );
        updateUnread(_.size(unreadReports));
    },
});
