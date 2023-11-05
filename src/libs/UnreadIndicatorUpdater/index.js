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
        const unreadReports = _.filter(reportsFromOnyx, (report) => ReportUtils.isUnread(report) && report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
        updateUnread(_.size(unreadReports));
    },
});
