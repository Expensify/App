import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import updateUnread from './updateUnread/index';

let allReports = [];

const triggerUnreadUpdate = (reports = allReports) => {
    const currentReportID = navigationRef.isReady() ? Navigation.getTopmostReportId() : '';
    const unreadReports = _.filter(reports, (report) => ReportUtils.isUnread(report) && ReportUtils.shouldReportBeInOptionList(report, currentReportID));
    updateUnread(_.size(unreadReports));
};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        allReports = reportsFromOnyx;
        triggerUnreadUpdate();
    },
});

navigationRef.addListener('state', () => {
    triggerUnreadUpdate();
});
