import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread/index';
import * as ReportUtils from '../ReportUtils';

let unreadReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        console.log('!!!', reportsFromOnyx)
        unreadReports = _.filter(reportsFromOnyx, ReportUtils.isUnread);
        console.log('!!!', _.size(unreadReports));

        updateUnread(_.size(unreadReports));
    },
});
