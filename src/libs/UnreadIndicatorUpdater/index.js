import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread/index';
import * as ReportUtils from '../ReportUtils';

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        const unreadReports = _.filter(reportsFromOnyx, ReportUtils.isUnread);
        updateUnread(_.size(unreadReports));
    },
});
