import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import updateUnread from './updateUnread/index';

let priorityMode = CONST.PRIORITY_MODE.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: val => {
        priorityMode = _.isString(val) ? val : 'default';

        // eslint-disable-next-line no-use-before-define
        calculate();
    },
});

let reportsFromOnyx = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (val) => {
        reportsFromOnyx = val;

        // eslint-disable-next-line no-use-before-define
        calculate();
    },
});

function calculate() {
    let unreadReports = _.filter(reportsFromOnyx, (report) => ReportUtils.isUnread(report) && report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

    // If we are in #focus mode then we don't want to count any archived rooms since they will be hidden
    if (priorityMode === CONST.PRIORITY_MODE.GSD) {
        unreadReports = _.without(unreadReports, (report) => ReportUtils.isArchivedRoom(report));
    }

    updateUnread(_.size(unreadReports));
}
