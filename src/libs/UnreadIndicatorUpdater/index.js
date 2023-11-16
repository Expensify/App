import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import updateUnread from './updateUnread/index';

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        const unreadReports = _.filter(reportsFromOnyx, (report) => ReportUtils.isUnread(report) && ReportUtils.shouldReportBeInOptionList(report, Navigation.getTopmostReportId()));
        updateUnread(_.size(unreadReports));
    },
});
