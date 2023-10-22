import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Navigation from '../Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread/index';
import * as ReportUtils from '../ReportUtils';

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        const unreadReports = _.filter(reportsFromOnyx, (report) => ReportUtils.isUnread(report) && ReportUtils.shouldReportBeInOptionList(report, Navigation.getTopmostReportId()));
        updateUnread(_.size(unreadReports));
    },
});
